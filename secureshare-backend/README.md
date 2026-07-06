# SecureShare Backend

FastAPI backend for SecureShare.

## Local run

```bash
cd secureshare-backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Health check:

```text
http://localhost:8000/health
```

## Important AWS credential rule

Do not put AWS access keys in `.env` or code.
When deployed on EC2, boto3 automatically uses the EC2 IAM Role attached to the instance.
