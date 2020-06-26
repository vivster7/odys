import datetime
import os

import requests
import sqlalchemy

slack_feedback_url = os.environ["SLACK_FEEDBACK_WEBHOOK_URL"]
slack_boxes_url = os.environ["SLACK_BOXES_WEBHOOK_URL"]

connection_name = os.environ["DB_CONNECTION_NAME"]
db_password = os.environ["DB_CONNECTION_PASSWORD"]
db_name = "odys_production"
db_user = "postgres"
driver_name = "postgres+pg8000"
query_string = dict({"unix_sock": "/cloudsql/{}/.s.PGSQL.5432".format(connection_name)})

db = sqlalchemy.create_engine(
    sqlalchemy.engine.url.URL(
        drivername=driver_name,
        username=db_user,
        password=db_password,
        database=db_name,
        query=query_string,
    ),
    pool_size=5,
    max_overflow=2,
    pool_timeout=30,
    pool_recycle=1800,
)


def execute(stmt):
    try:
        with db.connect() as conn:
            return conn.execute(stmt)
    except Exception as e:
        return "Error: {}".format(str(e))


eleven_minutes_ago = datetime.datetime.now() - datetime.timedelta(minutes=11)


def feedback_query():
    stmt = sqlalchemy.text('SELECT text from api."feedback"')
    return execute(stmt)


def new_shapes_query():
    stmt = sqlalchemy.text(
        f'SELECT count(*) from api."shape" where created_at > {eleven_minutes_ago}'
    )
    return execute(stmt)


def message(url, payload):
    requests.post(
        url, data={"text": payload}, headers={"Content-type": "application/json"}
    )


def notify(event, context):
    """Triggered from a message on a Cloud Pub/Sub topic.
    Args:
         event (dict): Event payload.
         context (google.cloud.functions.Context): Metadata for the event.
    """
    for row in feedback_query():
        message(slack_feedback_url, row["text"])

    for row in new_shapes_query():
        message(slack_boxes_url, row["count"])

    # pubsub_message = base64.b64decode(event['data']).decode('utf-8')
    # print(pubsub_message)
