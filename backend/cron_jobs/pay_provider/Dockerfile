FROM python:3.6

RUN apt-get update \
    && apt-get install -y cron \
    && apt-get autoremove -y \
    && apt-get install -y python-mysqldb

WORKDIR /code

COPY ./requirements.txt .
RUN pip3 install -r requirements.txt

COPY . .
COPY ./cron /etc/cron.d/pay_provider_cron

RUN touch /var/log/cron.log

RUN chmod a+x ./run.sh
RUN chmod a+x ./start.sh
RUN chmod a+x /etc/cron.d/pay_provider_cron

RUN crontab /etc/cron.d/pay_provider_cron

CMD ["./start.sh"]
