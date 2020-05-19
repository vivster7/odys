#!/bin/bash

# Current directory of script
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd $DIR
cd ../deploy


docker build -t whiteboard-systems-postgrest -t us.gcr.io/odys-1/whiteboard-systems-postgrest .
docker push us.gcr.io/odys-1/whiteboard-systems-postgrest
gcloud run deploy odys-postgrest --image us.gcr.io/odys-1/whiteboard-systems-postgrest --region=us-central1 --platform=managed
