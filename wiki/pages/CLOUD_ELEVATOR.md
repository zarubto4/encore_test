# Installing Cloud-elevator and Port Forwarding

## Steps to install :

1) `brew install kubernetes-cli`
2) `brew tap groupon/engineering git@github.groupondev.com:engineering/homebrew-groupon.git`
3) `brew update && brew install cloud-elevator`
4) `brew info cloud-elevator` This gets the info regarding the plug-in for the cloud, make sure you have most recent version
5) `brew update && brew upgrade cloud-elevator`
6) `brew install kubectx`
7) `kubectl cloud-elevator auth browser` Used to authenticate your access via browser

## Steps to connect to an Environment:
Use specified environment Example:
`kubectl config use-context crm-message-service-staging-us-west-1`
`kubectl config use-context crm-message-service-production-us-west-2`   (For Connecting to Prod) 

