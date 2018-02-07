const commander = require('commander')
const express = require('express')
const fs = require('fs')
var opn = require('opn')

commander.option('--port [port]', 'the port to run gitlab-ci-dashboard')
commander.option('--gitlab [gitlab server host]', 'your gitlab server host')
commander.option('--token [token]', 'gitlab token')
commander.option('--config [config]', 'config file with all configurations')
commander.option('--apiVersion [apiVersion]', '(optional): gitlab api version. Default: 3')
commander.option('--projectsFile [projectsFile]', 'an url to file that contains a list of projects you want to monitor')
commander.option('--gitlabciProtocol [gitlabciProtocol]', '(optional): protocol to access gitlabci api. Default: https')
commander.option('--hideSuccessCards [hideSuccessCards]', '(optional): hide cards when change to success status. Default: false')
commander.option('--hideVersion [hideVersion]', '(optional): hide version of cards. Default: true')
commander.option('--interval [interval]', '(optional): interval, in seconds, that monitor go to gitlab server take a new data. Default 60')

commander.parse(process.argv)

const configFile = commander.config || process.env.CONFIG
const port = commander.port || process.env.PORT || 8081
const gitlab = commander.gitlab || process.env.GITLAB
const token = commander.token || process.env.TOKEN
const projectsFile = commander.projectsFile || process.env.PROJECTS_FILE
const gitlabciProtocol = commander.gitlabciProtocol || process.env.GITLABCI_PROTOCOL || 'https'
const hideSuccessCards = commander.hideSuccessCards || process.env.HIDE_SUCCESS_CARDS || false
const apiVersion = commander.apiVersion || process.env.API_VERSION || '3'
const hideVersion = commander.hideVersion || process.env.HIDE_VERSION || false
const interval = commander.interval || process.env.INTERVAL || 60

const startServer = (params) => {
  const app = express()
  app.use('/', express.static(__dirname + '/'))
  app.use('/params', (req, res) => {
    res.json(params)
  })

  const server = app.listen(port, () => {
    const uri = `http://localhost:${server.address().port}/?standalone=true`
    console.log(`The dashboard is now available at ${uri}`)
    opn(uri)
  })
}

let projects = []
if (configFile) {
  fs.readFile(configFile, 'utf8', function (err, data) {
    if (err) {
      return console.log(err)
    }
    const json = JSON.parse(data)
    const {config, projects} = json.dashboard
    const params = {
      gitlab: config.gitlab,
      token: config.token,
      projects,
      gitlabciProtocol: config.gitlabciProtocol,
      hideSuccessCards: config.hideSuccessCards,
      apiVersion: config.apiVersion,
      hideVersion: config.hideVersion,
      interval: config.interval
    }

    startServer(params)
  })
} else if (projectsFile != null) {
  fs.readFile(projectsFile, 'utf8', function (err, data) {
    if (err) {
      return console.log(err)
    }
    projects = JSON.parse(data)
    const params = {
      gitlab,
      token,
      projects,
      gitlabciProtocol,
      hideSuccessCards,
      apiVersion,
      hideVersion,
      interval
    }

    startServer(params)
  })
}
