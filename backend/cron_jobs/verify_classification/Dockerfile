FROM python:3.6

# TODO: env vars

RUN apt-get update \
    && apt-get install -y cron \
    && apt-get autoremove -y \
    && apt-get install -y python-mysqldb

RUN mkdir /code
WORKDIR /code

COPY ./requirements.txt /code/requirements.txt
RUN pip3 install -r requirements.txt

COPY ./verify_classification.py /code/verify_classification.py
COPY ./verify_classification_cron /etc/cron.d/verify_classification_cron
COPY ./env_vars.sh /code/env_vars.sh
COPY ./run.sh /code/run.sh

RUN touch /var/log/cron.log

RUN chmod a+x /etc/cron.d/verify_classification_cron
RUN chmod a+x /code/env_vars.sh
RUN chmod a+x /code/run.sh

RUN crontab /etc/cron.d/verify_classification_cron

CMD cron && tail -f /var/log/cron.log
