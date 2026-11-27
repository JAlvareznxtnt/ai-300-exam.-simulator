# Question verification

**Resume from:** domain 5 (nothing in the list below is checked yet).

## Worth verifying

Checked in this order. All remaining synthetic questions are included.

| Domain | Synthetic | Bank (why) |
|---|---|---|
| Domain 5: Optimize GenAI | 3043, 3044, 3045, 3046, 3047, 3048, 3049, 3050 | 16 (fine-tune form fields), 19 (GPU requirement for fine-tuning) |
| Domain 2: ML model lifecycle | 3011, 3012, 3013, 3014, 3015, 3016, 3017, 3018, 3019, 3020, 3021, 3022, 3023, 3024, 3054, 3055, 3056, 2001, 2002, 2004 | 62 (SDK parameter name), 77 (endpoint type (our own grading)), 78 (MLflow API call (our own grading)), 82 (scoring script functions (our own grading)), 84 (deployment setting name (our own grading)) |
| Domain 3: GenAIOps infrastructure | 3025, 3026, 3028, 3029, 3030, 3031, 3032, 3033, 3034, 3035, 3051, 3052, 3053, 1001, 1002, 3058, 3059, 3060, 3061 | 21 (benchmark metric names), 22 (role names), 24 (deployment type behaviour), 25 (provisioned throughput facts), 67 (model version upgrade setting) |
| Domain 4: GenAI QA and observability | 3036, 3037, 3038, 3039, 3040, 3041, 3042, 1003, 1004, 1005 | 72 (evaluator names), 73 (YAML property), 74 (tool capabilities and cost tags), 75 (metric definition), 76 (evaluator input names), 79 (metric names (our own grading)), 80 (content safety feature names (our own grading)) |

## Skipped (reason)

| Reason | Questions |
|---|---|
| Workflow or process reasoning, no specific documented name, limit or default | 17, 31, 69 |
| Scenario reasoning: what to do with data, prompts or rollout | 18, 23, 28, 32, 33, 68, 70, 83 |
| General concept or definition, no checkable parameter | 27, 40, 66 |
| Architecture or catalog judgment, no checkable parameter | 29, 34 |
| Decided earlier: docs don't confirm | 56, 59, 81 |
| Already checked (priority questions, domain 1, domain 2 part 1) | 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 20, 35, 36, 37, 38, 39, 41, 42, 43, 44, 45, 47, 48, 49, 50, 51, 52, 53, 54, 55, 57, 58, 60, 61, 63, 64, 65, 2003, 2005, 3001, 3002, 3003, 3004, 3005, 3006, 3007, 3008, 3009, 3010, 3027, 3057 |

## How to read this file

Each question is checked against Microsoft Learn. `sources` in the data lists the same pages.

- **Verified yes**: the cited pages support the keyed answer, after any change listed.
- **Verified no**: they do not, or support it only in part. The question carries a note.
- **no (docs don't confirm)**: the pages neither support nor contradict the key.
- **no (docs contradict)**: listed under Needs your decision.
- Remarks in the last column name details the cited pages do not cover.

Pages were read through the Microsoft Learn MCP server on 2026-11-27. The priority questions and domain 1 were checked before wrong-option claims were recorded.

## Needs your decision

Microsoft Learn contradicts these keys. The keys are unchanged.

| Question | Key (source: the question bank) | What Microsoft Learn says | Learn source |
|---|---|---|---|
| 8 | A: --traffic "version1=90, version2=10" | The values are space-separated key=value pairs in quotes, with no comma. The 90/10 split itself is right, so only the syntax in the options differs. | [az ml online-endpoint](https://learn.microsoft.com/cli/azure/ml/online-endpoint?view=azure-cli-latest)<br>[Perform safe rollout of new deployments for real-time inference](https://learn.microsoft.com/azure/machine-learning/how-to-safely-rollout-online-endpoints?view=azureml-api-2) |
| 42 | A: BanditPolicy(slack_amount=0.35, ...) for "35% worse in ratio" | slack_factor is the ratio and slack_amount is an absolute value. No option uses slack_factor. | [Hyperparameter tuning a model (v2)](https://learn.microsoft.com/azure/machine-learning/how-to-tune-hyperparameters?view=azureml-api-2)<br>[BanditPolicy Class](https://learn.microsoft.com/python/api/azure-ai-ml/azure.ai.ml.sweep.banditpolicy?view=azure-python) |

## Priority questions

4 questions: 3 verified, 1 not.

| Question | Source | Verified | What changed |
|---|---|---|---|
| 3027 | [What is provisioned throughput for Foundry Models?](https://learn.microsoft.com/azure/foundry/openai/concepts/provisioned-throughput)<br>[Provisioned throughput billing and cost management](https://learn.microsoft.com/azure/ai-foundry/openai/how-to/provisioned-throughput-onboarding)<br>[Quickstart: Create a provisioned throughput deployment](https://learn.microsoft.com/azure/foundry/openai/provisioned-quickstart)<br>[Deployment types for Microsoft Foundry Models](https://learn.microsoft.com/azure/foundry/foundry-models/concepts/deployment-types) | yes | No change. The docs support all four steps and their order. The two added distractors belong to Standard (token quota) and Batch (asynchronous) deployments. |
| 2005 | [Perform safe rollout of new deployments for real-time inference](https://learn.microsoft.com/azure/machine-learning/how-to-safely-rollout-online-endpoints?view=azureml-api-2)<br>[Data concepts in Azure Machine Learning](https://learn.microsoft.com/azure/machine-learning/concept-data?view=azureml-api-2)<br>[Hyperparameter tuning a model (v2)](https://learn.microsoft.com/azure/machine-learning/how-to-tune-hyperparameters?view=azureml-api-2) | yes | Rationale fixed: a data asset is a convenience over a storage URI, so "data must exist as an asset before training reads it" now applies to this case study only. Mirrored traffic is not returned to clients, which rules out the 10% live-traffic distractor. No single page lists the whole five-step order; it follows from the case. |
| 20 | [RAG chunking phase](https://learn.microsoft.com/azure/architecture/ai-ml/guide/rag/rag-chunking-phase) | yes | Added a note. The page supports structure-based chunking and removing content to ignore, but does not compare the cost of the four options. |
| 81 | [How to use Open Source foundation models curated by Azure Machine Learning](https://learn.microsoft.com/azure/machine-learning/how-to-use-foundation-models?view=azureml-api-2) | no (docs don't confirm) | Key kept. It is our own grading: the platform showed no key. The page only says evaluation metrics can be viewed once the fine-tuning job completes; it names neither keyed option. |

## Domain 1: MLOps infrastructure

29 questions: 28 verified, 1 not.

| Question | Source | Verified | What changed |
|---|---|---|---|
| 35 | [WorkspaceOperations Class](https://learn.microsoft.com/python/api/azure-ai-ml/azure.ai.ml.operations.workspaceoperations?view=azure-python)<br>[Manage Azure Machine Learning workspaces in the portal or with the Python SDK (v2)](https://learn.microsoft.com/azure/machine-learning/how-to-manage-workspace?view=azureml-api-2) | yes | Rationale fixed: get() takes the workspace name; subscription and resource group come from the MLClient. |
| 36 | [Bicep What-If: Preview Changes Before Deployment](https://learn.microsoft.com/azure/azure-resource-manager/bicep/deploy-what-if)<br>[Deploy Bicep files with the Azure CLI](https://learn.microsoft.com/azure/azure-resource-manager/bicep/deploy-cli) | yes | No change. |
| 37 | [Data concepts in Azure Machine Learning](https://learn.microsoft.com/azure/machine-learning/concept-data?view=azureml-api-2) | yes | No change. Current docs call this a data asset. |
| 38 | [Create datastores](https://learn.microsoft.com/azure/machine-learning/how-to-datastore?view=azureml-api-2)<br>[Azure Data Lake Storage hierarchical namespace](https://learn.microsoft.com/azure/storage/blobs/data-lake-storage-namespace) | yes | No change. |
| 43 | [What is an Azure Machine Learning component?](https://learn.microsoft.com/azure/machine-learning/concept-component?view=azureml-api-2) | yes | No change. |
| 47 | [What are Azure Machine Learning environments?](https://learn.microsoft.com/azure/machine-learning/concept-environments?view=azureml-api-2) | yes | No change. |
| 48 | [Use the Azure Login action with OpenID Connect](https://learn.microsoft.com/azure/developer/github/connect-from-azure-openid-connect)<br>[Deploy to Azure infrastructure with GitHub Actions](https://learn.microsoft.com/devops/deliver/iac-github-actions) | yes | Stem typo fixed: "OpenID Connector" to "OpenID Connect". |
| 50 | [az ml environment](https://learn.microsoft.com/cli/azure/ml/environment?view=azure-cli-latest) | yes | No change. |
| 51 | [Create an Azure Machine Learning compute instance](https://learn.microsoft.com/azure/machine-learning/how-to-create-compute-instance?view=azureml-api-2)<br>[What are compute targets in Azure Machine Learning?](https://learn.microsoft.com/azure/machine-learning/concept-compute-target?view=azureml-api-2) | yes | No change. |
| 52 | [Working with tables in Azure Machine Learning](https://learn.microsoft.com/azure/machine-learning/how-to-mltable?view=azureml-api-2) | yes | Added a note: the wording follows the older Dataset class; MLTable has the same method. |
| 53 | [Workspace managed virtual network isolation](https://learn.microsoft.com/azure/machine-learning/how-to-managed-network?view=azureml-api-2) | yes | No change. |
| 54 | [Manage Azure Machine Learning workspaces in the portal or with the Python SDK (v2)](https://learn.microsoft.com/azure/machine-learning/how-to-manage-workspace?view=azureml-api-2)<br>[CustomerManagedKey Class](https://learn.microsoft.com/python/api/azure-ai-ml/azure.ai.ml.entities.customermanagedkey?view=azure-python) | yes | Added the missing commas in the code of all four options, matching the documented sample. |
| 55 | [Git integration for Azure Machine Learning](https://learn.microsoft.com/azure/machine-learning/concept-train-model-git-integration?view=azureml-api-2) | yes | No change. |
| 56 | [What are compute targets in Azure Machine Learning?](https://learn.microsoft.com/azure/machine-learning/concept-compute-target?view=azureml-api-2)<br>[Resource availability & quota limits for ACI](https://learn.microsoft.com/azure/container-instances/container-instances-resource-and-quota-limits) | no (docs don't confirm) | Platform key kept. The docs do not list Container Instances as a training target. Removed the wrong claim that a compute instance cannot provide 16 CPUs, and extended the note. |
| 63 | [Workspace managed virtual network isolation](https://learn.microsoft.com/azure/machine-learning/how-to-managed-network?view=azureml-api-2)<br>[Microsoft.MachineLearningServices workspaces/outboundRules 2025-09-01](https://learn.microsoft.com/azure/templates/microsoft.machinelearningservices/2025-09-01/workspaces/outboundrules) | yes | No change. |
| 64 | [What are Azure Machine Learning environments?](https://learn.microsoft.com/azure/machine-learning/concept-environments?view=azureml-api-2) | yes | Rationale fixed: it said registering the first environment creates a redundant one; it is the duplicate that is redundant. |
| 65 | [Use the Azure Login action with OpenID Connect](https://learn.microsoft.com/azure/developer/github/connect-from-azure-openid-connect) | yes | No change. The page covers the federated login; the least-privilege role assignment was not checked separately. |
| 3001 | [Set up authentication between Azure Machine Learning and other services](https://learn.microsoft.com/azure/machine-learning/how-to-identity-based-service-authentication?view=azureml-api-2) | yes | No change. |
| 3002 | [Set up authentication between Azure Machine Learning and other services](https://learn.microsoft.com/azure/machine-learning/how-to-identity-based-service-authentication?view=azureml-api-2)<br>[Create datastores](https://learn.microsoft.com/azure/machine-learning/how-to-datastore?view=azureml-api-2) | yes | No change. |
| 3003 | [CLI (v2) MLtable YAML schema](https://learn.microsoft.com/azure/machine-learning/reference-yaml-mltable?view=azureml-api-2)<br>[Working with tables in Azure Machine Learning](https://learn.microsoft.com/azure/machine-learning/how-to-mltable?view=azureml-api-2) | yes | No change. |
| 3004 | [What are Azure Machine Learning environments?](https://learn.microsoft.com/azure/machine-learning/concept-environments?view=azureml-api-2)<br>[Troubleshooting environment issues](https://learn.microsoft.com/azure/machine-learning/how-to-troubleshoot-environments?view=azureml-api-2) | yes | No change. |
| 3005 | [Machine learning registries for MLOps](https://learn.microsoft.com/azure/machine-learning/concept-machine-learning-registries-mlops?view=azureml-api-2) | yes | No change. |
| 3006 | [Configure a private endpoint for an Azure Machine Learning workspace](https://learn.microsoft.com/azure/machine-learning/how-to-configure-private-link?view=azureml-api-2) | yes | No change. |
| 3007 | [Bicep What-If: Preview Changes Before Deployment](https://learn.microsoft.com/azure/azure-resource-manager/bicep/deploy-what-if)<br>[Azure Resource Manager deployment modes](https://learn.microsoft.com/azure/azure-resource-manager/templates/deployment-modes) | yes | No change. The pages do not say in so many words that "validate" omits the list of changes. |
| 3008 | [Reference existing resources in Bicep](https://learn.microsoft.com/azure/azure-resource-manager/bicep/existing-resource) | yes | No change. The page covers "existing"; it does not show a role assignment scoped this way. |
| 3009 | [Undo changes](https://learn.microsoft.com/azure/devops/repos/git/undo?view=azure-devops) | yes | No change. |
| 3010 | [Manage access to Azure Machine Learning workspaces](https://learn.microsoft.com/azure/machine-learning/how-to-assign-roles?view=azureml-api-2) | yes | No change. |
| 2003 | [Access Azure resources from an online endpoint with a managed identity](https://learn.microsoft.com/azure/machine-learning/how-to-access-resources-from-endpoints-managed-identities?view=azureml-api-2) | yes | No change. |
| 3057 | [Configure an app to trust an external identity provider](https://learn.microsoft.com/entra/workload-id/workload-identity-federation-create-trust)<br>[Migrate GitHub Actions federated credentials to immutable subjects](https://learn.microsoft.com/entra/workload-id/workload-identities-github-immutable-subjects) | yes | Fixed: since July 15, 2026 new, renamed or transferred repositories use an ID-based subject. The stem now says the repository uses the name-based format, and the rationale explains the other one. (The Microsoft page writes the pull request subject as "pull-request"; the distractor was left as "pull_request".) |

## Domain 2: ML model lifecycle (part 1 of 2)

26 questions: 23 verified, 3 not.

Wrong-option explanations were checked only where they state a specific technical claim.

| Question | Source | Verified | Wrong-option claims checked | What changed |
|---|---|---|---|---|
| 1 | [Deploy and score a machine learning model by using an online endpoint](https://learn.microsoft.com/azure/machine-learning/how-to-deploy-online-endpoints?view=azureml-api-2) | yes | An endpoint class cannot be used to deploy: contradicted. | Rationale fixed: the endpoint class defines and creates the endpoint; instance type, environment and code belong to the deployment. |
| 2 | [What is automated machine learning (AutoML)?](https://learn.microsoft.com/azure/machine-learning/concept-automated-ml?view=azureml-api-2) | yes | AutoML does not support clustering or dimensionality reduction: consistent (neither is among the listed tasks). | No change. |
| 3 | [Work with registered models in Azure Machine Learning](https://learn.microsoft.com/azure/machine-learning/how-to-manage-models?view=azureml-api-2) | yes | Deployment, child runs and Application Insights do not store model versions: not stated in the cited page. | No change. |
| 4 | [Feature retrieval specification and usage in training and inference](https://learn.microsoft.com/azure/machine-learning/feature-retrieval-concepts?view=azureml-api-2)<br>[Feature set materialization concepts](https://learn.microsoft.com/azure/machine-learning/feature-set-materialization-concepts?view=azureml-api-2) | yes | Materialization settings control feature data availability: supported. Claims about feature set specifications and observation data: not stated in so many words. | No change. |
| 5 | [Manage models registry in Azure Machine Learning with MLflow](https://learn.microsoft.com/azure/machine-learning/how-to-manage-models-mlflow?view=azureml-api-2)<br>[Log metrics, parameters, and files with MLflow](https://learn.microsoft.com/azure/machine-learning/how-to-log-view-metrics?view=azureml-api-2) | yes | get_run returns run information; log_param and log_artifact only log: supported. | No change. |
| 6 | [Create and run machine learning pipelines by using components with the Azure Machine Learning SDK v2](https://learn.microsoft.com/azure/machine-learning/how-to-create-component-pipeline-python?view=azureml-api-2) | yes | None to check. | No change. |
| 7 | [DatasetConsumptionConfig Class](https://learn.microsoft.com/python/api/azureml-core/azureml.data.dataset_consumption_config.datasetconsumptionconfig?view=azure-ml-py)<br>[FileDataset Class](https://learn.microsoft.com/python/api/azureml-core/azureml.data.filedataset?view=azure-ml-py)<br>[Run Class](https://learn.microsoft.com/python/api/azureml-core/azureml.core.run(class)?view=azure-ml-py)<br>[What is Azure Machine Learning CLI and Python SDK v2?](https://learn.microsoft.com/azure/machine-learning/concept-v2?view=azureml-api-2) | yes | download() writes local files, unlike as_mount() on the compute target: supported. "Leave the script name out of arguments": not checked. | Added a note: SDK v1 and its end-of-support date. |
| 8 | [Perform safe rollout of new deployments for real-time inference](https://learn.microsoft.com/azure/machine-learning/how-to-safely-rollout-online-endpoints?view=azureml-api-2)<br>[az ml online-endpoint](https://learn.microsoft.com/cli/azure/ml/online-endpoint?view=azure-cli-latest) | no (docs contradict) | --mirror-traffic sends 100% to several endpoints: contradicted. --name renames the endpoint: contradicted. | Rationale fixed for both options. Added a note about the comma. See Needs your decision. |
| 9 | [Evaluate automated machine learning experiment results](https://learn.microsoft.com/azure/machine-learning/how-to-understand-automated-ml?view=azureml-api-2)<br>[Log metrics, parameters, and files with MLflow](https://learn.microsoft.com/azure/machine-learning/how-to-log-view-metrics?view=azureml-api-2) | yes | Recall, precision and accuracy are classification metrics: supported. | No change. |
| 10 | [Use Azure Machine Learning studio to debug pipeline failures](https://learn.microsoft.com/azure/machine-learning/how-to-debug-pipeline-failure?view=azureml-api-2) | yes | Status is not filled back into the authoring page: not stated in pages found. | No change. |
| 11 | [Log metrics, parameters, and files with MLflow](https://learn.microsoft.com/azure/machine-learning/how-to-log-view-metrics?view=azureml-api-2) | yes | log_param is for parameters and log_artifact for files: supported. | No change. |
| 12 | [Set up AutoML training for tabular data with the Azure Machine Learning CLI and Python SDK](https://learn.microsoft.com/azure/machine-learning/how-to-configure-auto-train?view=azureml-api-2) | yes | Spearman correlation is not typically a primary metric: contradicted (it is a supported choice). | Rationale fixed. The page gives price prediction as the example for this metric; the claim that it is the default was not confirmed. |
| 13 | [Hyperparameter tuning a model (v2)](https://learn.microsoft.com/azure/machine-learning/how-to-tune-hyperparameters?view=azureml-api-2) | yes | None to check. | No change. |
| 14 | [Work with registered models in Azure Machine Learning](https://learn.microsoft.com/azure/machine-learning/how-to-manage-models?view=azureml-api-2) | yes | A tag or a data asset does not create a model version: not stated in so many words. | No change. |
| 15 | [Guidelines for deploying MLflow models](https://learn.microsoft.com/azure/machine-learning/how-to-deploy-mlflow-models?view=azureml-api-2) | yes | None to check. | No change. |
| 39 | [What is automated machine learning (AutoML)?](https://learn.microsoft.com/azure/machine-learning/concept-automated-ml?view=azureml-api-2) | yes | The other tools do not search for the best model: not checked. | No change. |
| 41 | [Hyperparameter tuning a model (v2)](https://learn.microsoft.com/azure/machine-learning/how-to-tune-hyperparameters?view=azureml-api-2) | yes | Bandit and truncation selection are early termination policies: supported. | No change. The option names follow the older SDK. |
| 42 | [Hyperparameter tuning a model (v2)](https://learn.microsoft.com/azure/machine-learning/how-to-tune-hyperparameters?view=azureml-api-2)<br>[BanditPolicy Class](https://learn.microsoft.com/python/api/azure-ai-ml/azure.ai.ml.sweep.banditpolicy?view=azure-python) | no (docs contradict) | Other policies do not express the threshold: replaced with the documented slack definitions. | Rationale rewritten and note added. See Needs your decision. |
| 44 | [Azure Machine Learning as an Event Grid source](https://learn.microsoft.com/azure/event-grid/event-schema-machine-learning) | yes | None to check. | No change. |
| 45 | [Assess AI systems by using the Responsible AI dashboard](https://learn.microsoft.com/azure/machine-learning/concept-responsible-ai-dashboard?view=azureml-api-2)<br>[Share Responsible AI insights using the Responsible AI scorecard (preview)](https://learn.microsoft.com/azure/machine-learning/concept-responsible-ai-scorecard?view=azureml-api-2) | yes | None to check. | No change. The scorecard is marked preview. |
| 49 | [dsl Package](https://learn.microsoft.com/python/api/azure-ai-ml/azure.ai.ml.dsl?view=azure-python) | yes | None to check. | No change. |
| 57 | [Model interpretability](https://learn.microsoft.com/azure/machine-learning/how-to-machine-learning-interpretability?view=azureml-api-2) | yes | Global importance covers the whole model, local covers one prediction: supported. Precision and Gini remarks: not checked. | No change. |
| 58 | [Query and compare experiments and runs with MLflow](https://learn.microsoft.com/azure/machine-learning/how-to-track-experiments-mlflow?view=azureml-api-2)<br>[Log metrics, parameters, and files with MLflow](https://learn.microsoft.com/azure/machine-learning/how-to-log-view-metrics?view=azureml-api-2) | yes | None to check. | No change. The pages show mlflow.get_run() and not the MlflowClient method by name. |
| 59 | [Model performance and fairness](https://learn.microsoft.com/azure/machine-learning/concept-fairness-ml?view=azureml-api-2) | no (docs don't confirm) | Selection rate does not show fairness: contradicted. Influencer and Application Insights remarks: not checked. | Rationale fixed and note added. The page lists recall disparity and selection rate disparity as fairness measures and does not prefer one. |
| 60 | [Batch endpoints](https://learn.microsoft.com/azure/machine-learning/concept-endpoints-batch?view=azureml-api-2)<br>[Online endpoint deployment for real-time inferencing](https://learn.microsoft.com/azure/machine-learning/concept-endpoints-online?view=azureml-api-2) | yes | AKS underlies online endpoints: contradicted as a general statement (managed online endpoints do not need a cluster of yours). Conda remark: not checked. | Rationale fixed. |
| 61 | [Online endpoint deployment for real-time inferencing](https://learn.microsoft.com/azure/machine-learning/concept-endpoints-online?view=azureml-api-2)<br>[Batch endpoints](https://learn.microsoft.com/azure/machine-learning/concept-endpoints-batch?view=azureml-api-2) | yes | Batch is asynchronous; pipeline component deployments are for batch pipelines; Kubernetes endpoints need infrastructure you manage: supported. | No change. |
