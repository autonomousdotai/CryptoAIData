FROM python:3.6
RUN apt-get update
RUN apt-get install pandoc -y
ENV PYTHONUNBUFFERED 1
RUN mkdir /code
WORKDIR /code
ADD requirements.txt /code/
RUN pip3 install -r requirements.txt
ADD . /code/
RUN python3 manage.py migrate
RUN python3 manage.py runserver 0.0.0.0:8000