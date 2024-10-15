#!groovy
// VPCS NextJS Jenkinsfile
@Library('conveyor@latest-5')
@Library("conveyor-i-util@latest") _
def scm = [
  $class: 'GitSCM',
  extensions: [
    [
      $class: 'CloneOption',
      shallow: false,
      noTags: false,
      honorRefspec: true
    ]
  ],
  branches: scm.branches,
  userRemoteConfigs: scm.userRemoteConfigs
]

pipeline {
  agent none
  environment {
    NX_BRANCH = env.BRANCH_NAME.replace('PR-', '')
  }
   withCredentials([
    string(credentialsId: 'NLM_GH_TOKEN', variable: 'GH_TOKEN')
    string(credentialsId: 'NLM_NPM_EMAIL', variable: 'NPM_EMAIL'),
    string(credentialsId: 'NLM_NPM_USERNAME', variable: 'NPM_USERNAME'),
    string(credentialsId: 'NLM_NPM_PASSWORD_BASE64', variable: 'NPM_PASSWORD_BASE64')
  ])  {
    stages {
      stage('tests') {
        when {
          allOf {
            expression {
              return env.GITHUB_BRANCH == "showcase"
            }
          }
        }
        steps {
          stage('node tests'){
            checkout scm
            docker.image("docker-generic-us-west-2.artifactory.groupondev.com/alpine:3.18.0").inside
            parallel {
              stage('vpcs-nextjs'){
                sh "vpcs target @vpcs/vpcs-nextjs test"
              }
              stage('grpn-next-logging'){
                sh "vpcs target @vpcs/grpn-next-logging test"
              }
            }
          }
        }
      }
      stage('publish') {
        when {
          allOf {
            expression {
             return env.GITHUB_BRANCH == "showcase"
            }
          }
        }
        steps {
          nodeFormatted("multitenant") {
            checkout scm
            docker.image("${imgPfx}/alpine-node:16.2.0").inside {
              sh "pnpm exec release publish @vpcs/vpcs-nextjs --npm-email=${NPM_EMAIL} --npm-username=${NPM_USERNAME} --npm-password-base64=${NPM_PASSWORD_BASE64} --gh-token=${GH_TOKEN}"
              sh 'npx nlm release --commit'
            }
          }
        }
      }
    }
  }
}