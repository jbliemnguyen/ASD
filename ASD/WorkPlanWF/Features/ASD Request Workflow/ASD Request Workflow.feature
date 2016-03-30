<?xml version="1.0" encoding="utf-8"?>
<feature xmlns:dm0="http://schemas.microsoft.com/VisualStudio/2008/DslTools/Core" dslVersion="1.0.0.0" Id="7c1e1d1f-7895-4bf8-9f44-fcf743764d20" description="Creates workflow that generates items in the Work Plan list when requests are awarded." featureId="356fb8f6-81fb-4c40-a7c0-d6628f784d87" imageUrl="" receiverAssembly="Microsoft.SharePoint.WorkflowServices, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" receiverClass="Microsoft.SharePoint.WorkflowServices.SPWorkflowPackageFeatureReceiver" solutionId="00000000-0000-0000-0000-000000000000" title="ASD Workflow" version="" deploymentPath="$SharePoint.Project.FileNameWithoutExtension$_$SharePoint.Feature.FileNameWithoutExtension$" xmlns="http://schemas.microsoft.com/VisualStudio/2008/SharePointTools/FeatureModel">
  <activationDependencies>
    <referencedFeatureActivationDependency minimumVersion="" itemId="aac6da74-e8a5-4ee5-9874-5e9e1431769b" projectPath="..\ASD\ASD.csproj" />
  </activationDependencies>
  <projectItems>
    <projectItemReference itemId="491892e9-04f6-4d62-8c03-4a0ce65692e2" />
    <projectItemReference itemId="eced7df0-bd02-42a8-88ce-bf91a6a1d195" />
    <projectItemReference itemId="6ba57d8f-0ab6-423f-a2df-59a361e74f48" />
  </projectItems>
</feature>