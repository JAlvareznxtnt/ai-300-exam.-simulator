# Question verification

Each question is checked against Microsoft Learn. `sources` in the data lists the same pages.

- **Verified yes**: the cited pages support the keyed answer, after any change listed.
- **Verified no**: they do not, or support it only in part. The question carries a note.
- Remarks in the last column name details the cited pages do not cover.

Pages were read through the Microsoft Learn MCP server on 2026-11-27.

## Priority questions

4 questions: 3 verified, 1 not.

| Question | Source | Verified | What changed |
|---|---|---|---|
| 3027 | [What is provisioned throughput for Foundry Models?](https://learn.microsoft.com/azure/foundry/openai/concepts/provisioned-throughput)<br>[Provisioned throughput billing and cost management](https://learn.microsoft.com/azure/ai-foundry/openai/how-to/provisioned-throughput-onboarding)<br>[Quickstart: Create a provisioned throughput deployment](https://learn.microsoft.com/azure/foundry/openai/provisioned-quickstart)<br>[Deployment types for Microsoft Foundry Models](https://learn.microsoft.com/azure/foundry/foundry-models/concepts/deployment-types) | yes | No change. The docs support all four steps and their order. The two added distractors belong to Standard (token quota) and Batch (asynchronous) deployments. |
| 2005 | [Perform safe rollout of new deployments for real-time inference](https://learn.microsoft.com/azure/machine-learning/how-to-safely-rollout-online-endpoints?view=azureml-api-2)<br>[Data concepts in Azure Machine Learning](https://learn.microsoft.com/azure/machine-learning/concept-data?view=azureml-api-2)<br>[Hyperparameter tuning a model (v2)](https://learn.microsoft.com/azure/machine-learning/how-to-tune-hyperparameters?view=azureml-api-2) | yes | Rationale fixed: a data asset is a convenience over a storage URI, so "data must exist as an asset before training reads it" now applies to this case study only. Mirrored traffic is not returned to clients, which rules out the 10% live-traffic distractor. No single page lists the whole five-step order; it follows from the case. |
| 20 | [RAG chunking phase](https://learn.microsoft.com/azure/architecture/ai-ml/guide/rag/rag-chunking-phase) | yes | Added a note. The page supports structure-based chunking and removing content to ignore, but does not compare the cost of the four options. |
| 81 | [How to use Open Source foundation models curated by Azure Machine Learning](https://learn.microsoft.com/azure/machine-learning/how-to-use-foundation-models?view=azureml-api-2) | no | No change. The page only says evaluation metrics can be viewed once the fine-tuning job completes. It does not name the pipeline job or the fine-tuning component. The existing note already says unverified. |

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
| 56 | [What are compute targets in Azure Machine Learning?](https://learn.microsoft.com/azure/machine-learning/concept-compute-target?view=azureml-api-2)<br>[Resource availability & quota limits for ACI](https://learn.microsoft.com/azure/container-instances/container-instances-resource-and-quota-limits) | no | Key kept (platform key), but the docs do not list Container Instances as a training target. Removed the wrong claim that a compute instance cannot provide 16 CPUs, and extended the note. |
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
