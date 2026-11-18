from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class AirflowTaskInfo(BaseModel):
    task_id: str
    operator: str
    downstream_tasks: List[str]
    description: str

class AirflowDAGInfo(BaseModel):
    dag_id: str
    description: str
    schedule_interval: str
    is_paused: bool
    last_run_state: str  # success, running, failed, queued
    last_run_timestamp: Optional[str] = None
    next_run_timestamp: Optional[str] = None
    tasks: List[AirflowTaskInfo]
    tags: List[str]

class AirflowTriggerRequest(BaseModel):
    dag_id: str = Field(default="defiguard_ml_training_dag", description="DAG ID to trigger")
    conf: Optional[Dict[str, Any]] = None

class AirflowRunResponse(BaseModel):
    dag_id: str
    dag_run_id: str
    state: str
    execution_date: str
    message: str
    task_logs: List[Dict[str, str]]
    live_airflow_url: str = "http://localhost:8080"
