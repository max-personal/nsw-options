FROM python:latest

COPY static /app/static/
COPY templates /app/templates/
COPY app.py /app/
COPY requirements.txt /app/
COPY angular2/package.json /app/

WORKDIR /app/

RUN pip install -r requirements.txt

CMD ["python", "app.py"]
