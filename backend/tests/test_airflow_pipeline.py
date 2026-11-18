import uuid
import pytest
from fastapi.testclient import TestClient

@pytest.fixture
def auth_headers(client: TestClient):
    uid = uuid.uuid4().hex[:6]
    email = f"airflow_{uid}@defiguard.io"
    password = "Password123!"

    reg_res = client.post(
        "/api/v1/auth/register",
        json={"email": email, "password": password, "role": "admin"},
    )
    assert reg_res.status_code == 201

    login_res = client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": password},
    )
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_airflow_dags_listing(client: TestClient, auth_headers: dict):
    # 1. Fetch registered DAGs
    res = client.get("/api/v1/risk/airflow/dags", headers=auth_headers)
    assert res.status_code == 200
    dags = res.json()
    assert len(dags) >= 2

    dag_ids = [d["dag_id"] for d in dags]
    assert "defiguard_ml_training_dag" in dag_ids
    assert "defiguard_batch_inference_dag" in dag_ids

    # Verify task graph on training DAG
    training_dag = next(d for d in dags if d["dag_id"] == "defiguard_ml_training_dag")
    assert len(training_dag["tasks"]) == 5
    task_ids = [t["task_id"] for t in training_dag["tasks"]]
    assert "extract_onchain_transactions" in task_ids
    assert "engineer_risk_features" in task_ids
    assert "train_isolation_forest" in task_ids
    assert "evaluate_model_drift" in task_ids
    assert "register_model_artifact" in task_ids


def test_airflow_trigger_ml_training_dag(client: TestClient, auth_headers: dict):
    # Trigger ML Training DAG
    res = client.post(
        "/api/v1/risk/airflow/trigger",
        json={"dag_id": "defiguard_ml_training_dag"},
        headers=auth_headers,
    )
    assert res.status_code == 200
    data = res.json()
    assert data["dag_id"] == "defiguard_ml_training_dag"
    assert data["state"] in ["success", "queued", "running"]
    assert len(data["task_logs"]) >= 2
    tasks = [l["task"] for l in data["task_logs"]]
    assert "train_isolation_forest" in tasks or "running" in tasks


def test_airflow_trigger_batch_inference_dag(client: TestClient, auth_headers: dict):
    # Trigger Batch Inference DAG
    res = client.post(
        "/api/v1/risk/airflow/trigger",
        json={"dag_id": "defiguard_batch_inference_dag"},
        headers=auth_headers,
    )
    assert res.status_code == 200
    data = res.json()
    assert data["dag_id"] == "defiguard_batch_inference_dag"
    assert data["state"] in ["success", "queued", "running"]
    assert len(data["task_logs"]) >= 2
