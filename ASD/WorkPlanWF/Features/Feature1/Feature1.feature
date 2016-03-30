<?xml version="1.0" encoding="utf-8"?>
<feature xmlns:dm0="http://schemas.microsoft.com/VisualStudio/2008/DslTools/Core" dslVersion="1.0.0.0" Id="2ad7214f-c546-4bca-909c-31cc63735d21" description="Creates workflow that generates items in the Work Plan list when requests are awarded." featureId="bad5773d-f861-4bad-8aba-aaf9fca4d9a8" imageUrl="" receiverAssembly="Microsoft.SharePoint.WorkflowServices, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" receiverClass="Microsoft.SharePoint.WorkflowServices.SPWorkflowPackageFeatureReceiver" solutionId="00000000-0000-0000-0000-000000000000" title="ASD Workflow" version="" deploymentPath="$SharePoint.Project.FileNameWithoutExtension$_$SharePoint.Feature.FileNameWithoutExtension$" xmlns="http://schemas.microsoft.com/VisualStudio/2008/SharePointTools/FeatureModel">
  <activationDependencies>
    <referencedFeatureActivationDependency minimumVersion="" itemId="aac6da74-e8a5-4ee5-9874-5e9e1431769b" projectPath="..\ASD\ASD.csproj" />
  </activationDependencies>
  <projectItems>
    <projectItemReference itemId="a36c7277-a194-4e5e-8818-55435003020b" />
    <projectItemReference itemId="5bfa98d6-5f0e-4391-aea0-f8f0a11d1ea1" />
    <projectItemReference itemId="3deec092-fba4-4870-86aa-50816390bb06" />
  </projectItems>
</feature>