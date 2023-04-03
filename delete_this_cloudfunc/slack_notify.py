import datetime
import os

import requests
import sqlalchemy

slack_feedback_url = os.getenv("SLACK_FEEDBACK_WEBHOOK_URL")
slack_boxes_url = os.getenv("SLACK_BOXES_WEBHOOK_URL")

connection_name = os.getenv("DB_CONNECTION_NAME")
db_password = os.getenv("DB_CONNECTION_PASSWORD")
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


def feedback_query():
    now = datetime.datetime.now(datetime.timezone.utc)
    eleven_minutes_ago = now - datetime.timedelta(minutes=11)
    formatted = eleven_minutes_ago.replace(microsecond=0, tzinfo=None)

    stmt = sqlalchemy.text(
        f"SELECT text from api.\"feedback\" where created_at > '{formatted}';"
    )
    return execute(stmt)


def new_shapes_query():
    now = datetime.datetime.now(datetime.timezone.utc)
    eleven_minutes_ago = now - datetime.timedelta(minutes=11)
    formatted = eleven_minutes_ago.replace(microsecond=0, tzinfo=None)

    stmt = sqlalchemy.text(
        f"SELECT count(*) from api.\"shape\" where created_at > '{formatted}';"
    )
    return execute(stmt)


def message(url, payload):
    requests.post(
        url, json={"text": payload}, headers={"Content-type": "application/json"}
    )


def hello_pubsub(event, context):
    """Triggered from a message on a Cloud Pub/Sub topic.
    Args:
         event (dict): Event payload.
         context (google.cloud.functions.Context): Metadata for the event.
    """
    for row in feedback_query():
        message(slack_feedback_url, row["text"])

    for row in new_shapes_query():
        count = row["count"]
        if count != 0:
            message(slack_boxes_url, f"new shapes in last 10min: {count}")
