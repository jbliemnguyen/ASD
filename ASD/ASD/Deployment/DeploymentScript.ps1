param(
    [ValidateSet("DEV","TEST","PROD")]
    [parameter(mandatory=$true)]
    [string]$Environment = ("DEV","TEST","PROD")
)

$path = (Get-Location).Path
$timestamp = Get-Date

if ((Get-PSSnapin "Microsoft.SharePoint.PowerShell" -ErrorAction SilentlyContinue) -eq $null) 
{
    Add-PSSnapin "Microsoft.SharePoint.PowerShell"
}

Start-SPAssignment -global
Start-Transcript -Path "$($path)\ASD-Deployment.log" -Force

$timestamp = Get-Date
$path = (Get-Location).Path
$hostName = $env:COMPUTERNAME
# $hostNameSuffix = $hostName.Remove(0,$hostName.Length-2)
$Environments = @{
     "DEV" =
    @{
        "WebAppUrl" = "https://$($hostName).ferc.gov"
        "WebSiteUrl" = "https://$($hostName).ferc.gov/asd"
        "SQLServerName" = "fdc1s-sp23sqld1"
        "SQLInstance" = "SPSQL"
        "SQLBackupDir" = "F:\SQLBackups"
        "DBName" = "WFED2_Content_ASD1"
     }
    "TEST" = 
    @{
        "WebAppUrl" = "https://test.sp.ferc.gov/"
        "WebSiteUrl" = "https://test.sp.ferc.gov/asd"
        "SQLServerName" = "fdc1s-sp23sqlt1"
        "SQLInstance" = "SPSQL"
        "SQLBackupDir" = "F:\SQLBackups"
        "DBName" = "SPTEST_Content_ASD"
     }
     "PROD" = 
     @{
        "WebAppUrl" = "https://sp.ferc.gov/"
        "WebSiteUrl" = "https://sp.ferc.gov/asd"
        "SQLServerName" = "fdc1s-sp23sqlp1"
        "SQLInstance" = "SPSQL"
        "SQLBackupDir" = "F:\SQLBackups"
        "DBName" = "FERC_Content_ASD"
     }
}

$WebSiteUrl = $Environments.Get_Item($Environment).WebSiteUrl;
$web = Get-SPWeb $WebSiteUrl

function backupContentDB() {
    Write-Output "Backing up ASD Content DB..."

    $date = Get-Date -Format 'yyyy-MM-dd'
    # $ticks = $date.Ticks

    $instance = $Environments.Get_Item($Environment).SQLInstance;
    $localPath = $Environments.Get_Item($Environment).SQLBackupDir
    $dbName = $Environments.Get_Item($Environment).DBName
    $backupFilePath = $localPath + "\" + $dbName + "_" + $date + ".bak"

    $SQLConn = New-Object System.Data.SQLClient.SQLConnection
    $SQLConn.ConnectionString = "Server=" + $instance + "; Trusted_Connection=True"
    $SQLConn.Open()
    
    $SQLCmd = New-Object System.Data.SQLClient.SQLCommand
    $SQLCmd = $SQLConn.CreateCommand()
    $SQLCmd.commandtimeout=0
    $SQLCmd.CommandText="BACKUP DATABASE $dbName TO DISK = '$backupFilePath' WITH INIT"

    $SQLCmd.Executenonquery() | out-null

    Write-Output "Finished backing up ASD Content DB."
}

function addSCsToCTs() {
    Write-Output "Adding new field to ASD Base Content Type."    
    $newFieldSchema = '<Field Type="Boolean" DisplayName="SysIsAwarded" EnforceUniqueValues="FALSE" Indexed="FALSE" ID="{34f43612-3830-4750-9457-86bb7b7cfbfd}" StaticName="SysIsAwarded" Name="SysIsAwarded" Group="ASD Columns"><Default>0</Default></Field>'
    $web.Fields.AddFieldAsXml($newFieldSchema) | Out-Null
    $web.update()
    
    Write-Output "New field SysIsAwarded was added to site column."


    $field = $web.Fields["SysIsAwarded"] #| Out-Null
    $ctName = "ASD Base"
    $link = new-object Microsoft.SharePoint.SPFieldLink $field
    $ct = $web.ContentTypes[$ctName]
    $ct.FieldLinks.Add($link)
    $ct.Update($true)
    Write-Output "New field SysIsAwarded was added to ASD Base Content Type."

    $scs = @("Funding", "Notice of Intent", "Recompete Package")
    $cts = @("Product", "Product With Incidental Services", "Services", "BPA Call Or Task Delivery Order", "Change Order - Supplemental Agreement", "Exercising an Option Year")

    foreach($sc in $scs) {
        $field = $web.Fields[$sc]

        foreach($ctName in $cts) {
            $link = new-object Microsoft.SharePoint.SPFieldLink $field
            
            $ct = $web.ContentTypes[$ctName]
            Write-Output "Adding $($sc) to $($ct.name)"
            $ct.FieldLinks.Add($link)
            $ct.Update($true)
        }
    }
}

function createQuickLaunch() {
    $quicklaunch = $web.Navigation.QuickLaunch.parent
    $oldQuickLaunchLinks = $quicklaunch.children | Where {$_.title -ne "Home"} | Sort Title
    $newQuickLaunchLinks = @(
        @{
            "name" = "REQ Status"
            "url" = "/asd/SitePages/REQ%20Status.aspx"
        },
        @{
            "name" = "Acquisition Assistance Status"
            "url" = "/asd/SitePages/Acquisition%20Assistance%20Status.aspx"
        },
        @{
            "name" = "Contracts Library"
            "url" = "/asd/SitePages/Contracts%20Library.aspx"
        },
        @{
            "name" = "WorkLoad"
            "url" = "/asd/SitePages/WorkLoad.aspx"
        },
        @{
            "name" = "Work Plan"
            "url" = "/asd/SitePages/WorkPlan.aspx"
        },
        @{
            "name" = "My Assignments"
            "url" = "/asd/sitepages/my%20assignments.aspx"
        },
        @{
            "name" = "Business Days Off"
            "url" = "/asd/Lists/BusinessOffDays/AllItems.aspx"
        },
        @{
            "name" = "Admin"
            "url" = "/asd/SitePages/Admin.aspx"
        }
    )

    foreach($link in $oldQuickLaunchLinks) {
        Write-Output "Deleting the $($link.title) quick launch link..."
        #$link | gm
        $link.Delete();
    }

    Write-Output "All quick launch links are deleted."
    spacer
    Write-Output "Adding quick launch links..."
    Write-Output ""

    foreach($newLink in $newQuickLaunchLinks) {
        # Write-Output "Adding $($newLink.name) to the Quick Launch..."
        $navnode = New-Object Microsoft.SharePoint.Navigation.SPNavigationNode($newLink.name, $newLink.url, $false)

        $quickLaunch.Children.AddAsLast($navnode) | Out-Null

        Write-Output "Added $($newLink.name) to the Quick Launch."
    }

    Write-Output ""
    Write-Output "Finished adding quick launch links."
}

function configureAcqList() {
    enforceUniqueColumn

    spacer

    disableGridView
}

function New-SPGroup {
<#
.Synopsis
    Use New-SPGroup to create a SharePoint Group.
.Description
    This function uses the Add() method of a SharePoint RoleAssignments property in an SPWeb to create a SharePoint Group.
.Example
    C:\PS>New-SPGroup -Web http://intranet -GroupName "Test Group" -OwnerName DOMAIN\User -MemberName DOMAIN\User2 -Description "My Group"
    This example creates a group called "Test Group" in the http://intranet site, with a description of "My Group".  The owner is DOMAIN\User and the first member of the group is DOMAIN\User2.
.Notes
    Name: New-SPGroup
    Author: Ryan Dennis
    Last Edit: July 18th 2011
    Keywords: New-SPGroup
.Link
    http://www.sharepointryan.com
    http://twitter.com/SharePointRyan
.Inputs
    None
.Outputs
    None
#Requires -Version 2.0
#>
    [CmdletBinding()]
    Param(
        [string]$GroupName,
        [string]$OwnerName,
        [string]$MemberName,
        [string]$Description
    )

    if ($web.SiteGroups[$GroupName] -ne $null){
        Write-Output "Group $GroupName already exists!"   
        return
    }

<#
    if ($web.Site.WebApplication.UseClaimsAuthentication){
        Write-Host "CLAIMS"
        # $op = New-SPClaimsPrincipal $OwnerName -IdentityType WindowsSamAccountName
        # $mp = New-SPClaimsPrincipal $MemberName -IdentityType WindowsSamAccountName

        # $op = $op.substring($op.indexOf("|"))
        # $mp = $mp.substring($mp.indexOf("|"))

        $owner = $web.ensureUser($OwnerName)
        $member = $web.ensureUser($MemberName)
    } else {
#>
  
    $owner = $web.ensureUser($OwnerName)
    $member = $web.ensureUser($MemberName)
  
    $web.SiteGroups.Add($GroupName, $owner, $member, $Description)
    $SPGroup = $web.SiteGroups[$GroupName]
    $web.RoleAssignments.Add($SPGroup)
}

function createContractSpecialistGroup() {
    Write-Output "Creating Contract Specialist group..."

    $currentUser = $web.currentUser.UserLogin

    New-SPGroup "Contract Specialists" $currentUser $currentUser ""
    Write-Output "Contract Specialist group was created."

    Write-Output "Adding users to Contract Specialist group..."
    $group = $web.SiteGroups["Contract Specialists"]

    $user = $web.ensureUser("adferc\knled12")
    $group.addUser($user)

    Write-Output "Added users to Contract Specialist group."
}

function configurePermissionsForWorkPlan() {
    createContractSpecialistGroup

    $workPlanList = $web.Lists["Work Plan"]
    $workPlanList.BreakRoleInheritance($false, $false)


<#
    $listRoleAssignments = $workPlanList.RoleAssignments

    foreach($roleAssignment in $listRoleAssignments) {
        $listRoleAssignments.Remove($roleAssignment)
    }
#>
    $groups = $web.SiteGroups
   
    foreach($group in $groups) {
        $groupName = $group.Name

        if($groupName -eq "CO" -or $groupName -eq "Contract Specialists") {
            $permLevel = "Edit" # [Microsoft.SharePoint.SPBasePermissions]::EditListItems => This turned into Read for some reason...
        } else {
            $permLevel = "Read" # [Microsoft.SharePoint.SPBasePermissions]::ViewListItems => This turned into Design for some reason...
        }

        Add-SPPermissionToListGroup "Work Plan" $groupName $permLevel
    }

    Write-Output "Finished configuring Work Plan list permissions."
}

function Add-SPPermissionToListGroup {
    param ($ListName, $GroupName, $PermissionLevel)

    $list = $web.Lists.TryGetList($ListName)
    if ($list -ne $null)
    {
        if ($list.HasUniqueRoleAssignments -eq $False)
        {
            $list.BreakRoleInheritance($True)
        }
        else
        {
            if ($web.SiteGroups[$GroupName] -ne $null)
            {
                $group = $web.SiteGroups[$GroupName]
                $roleAssignment = new-object Microsoft.SharePoint.SPRoleAssignment($group)
                $roleDefinition = $web.RoleDefinitions[$PermissionLevel];
                $roleAssignment.RoleDefinitionBindings.Add($roleDefinition);
                $list.RoleAssignments.Add($roleAssignment)
                $list.Update();
                Write-Output "Successfully added $PermissionLevel permission to $GroupName group in $ListName list. "
            }
            else
            {
                Write-Output "Group $GroupName does not exist."
            }
        }
    }
    $web.Dispose()
}

function enforceUniqueColumn() {
    Write-Output "Setting Acquisition Assistance Form # for unique values..."
    $acqList = $web.Lists["Acquisition Assistance"]

    $title = $acqList.Fields.GetFieldByInternalName("Title");  

    $title.Indexed = $true;
    $title.Update();
    $title.EnforceUniqueValues = $true;
    $title.Update();
    Write-Output "Finished setting Acquisition Assistance Form # for unique values."
}

function disableGridView() {
    Write-Output "Disabling Acquisition Assistance grid editing..."

    $acqList = $web.Lists["Acquisition Assistance"]

    $acqList.disableGridEditing = $true
    $acqList.update()

    Write-Output "Finished disabling Acquisition Assistance grid editing."  
}

function SPACER() {
    Write-Host "`r`n******************************`r`n"
}


Write-Output "Start time: $($timestamp)"
Write-Output "Deploying to $($WebSiteUrl)`r`n"

try {

    SPACER    

    #backupContentDB

    SPACER

    Write-Output "Disabling ASD Feature..."
    $asdFeatureGuid = "36943116-5c2e-4f6b-9c17-d034c2a59846"

    Disable-SPFeature $asdFeatureGuid -Url $WebSiteUrl -Confirm:$false -force -ErrorAction SilentlyContinue
    Write-Output "Disabled ASD Feature."

    SPACER

    $asd = Get-ChildItem "$($path)\WSPs" -filter "ASD_v2.wsp"
    
    Write-Output "Updating ASD.wsp to $($asd.Name)"

    Add-SPUserSolution -LiteralPath $asd.FullName -Site $WebSiteUrl
    Update-SPUserSolution -Identity "ASD.wsp" -Site $WebSiteUrl -ToSolution $asd.Name 

    Write-Output "Successfully updated: $($asd.Name)`r`n"

    $wsps = Get-ChildItem "$($path)\WSPs" -filter "*.wsp" | ? {$_.Name -ne "ASD_v2.wsp"}
    foreach( $wsp in $wsps ) {
        Write-Output "Deploying $($wsp.Name)"

        Add-SPUserSolution -LiteralPath $wsp.FullName -Site $WebSiteUrl | Out-Null
        Install-SPUserSolution -Identity $wsp.Name -Site $WebSiteUrl | Out-Null

        Write-Output "Successfully deployed: $($wsp.Name)`r`n"
    }

	
    SPACER

    Write-Output "Enabling features..."

    # Enable Sandbox features
    $featureGuids = @(
        "736b9ef4-e738-4fbb-b692-1bd057f29fc2",
        "2f30afc6-f0ff-47e6-8fcc-4067a7d9b49c",
        "b6430416-d7f0-41d4-bf43-340f2ccd1b3f",
        "5ad2865f-5263-4f1f-94b6-10563c538939"
    )

    foreach($guid in $featureGuids) {
        Enable-SPFeature -Identity $guid -Url $WebSiteUrl
    }

    Write-Output "The features are enabled."

	

    SPACER

    Write-Output "Adding site columns to content types..."    
    
    addSCsToCTs

    Write-Output "Adding site columns to content types is finished."
    
    SPACER

    # ASD Workflow Feature
    Write-Output "Enabling ASD Workflow..."
    Enable-SPFeature -Identity "bad5773d-f861-4bad-8aba-aaf9fca4d9a8" -Url $WebSiteUrl
    Write-Output "ASD Workflow enabled."

    SPACER

	

    configureAcqList
    
    SPACER

    configurePermissionsForWorkPlan
    
    SPACER

    createQuickLaunch

    SPACER

    Write-Output "Enabling ASD Feature..."
    Enable-SPFeature $asdFeatureGuid -Url $WebSiteUrl

    Write-Output "ASD Feature re-enabled."
    SPACER

	
    
} catch [system.exception] {
    Write-Output "!!!!!!!!!!!!!!!!! ERROR !!!!!!!!!!!!!!!!!"
    Write-Output $_.Exception.Message
    Write-Output "!!!!!!!!!!!!!!!!! ERROR !!!!!!!!!!!!!!!!!"
} finally {
    $timestamp = Get-Date
    Write-Output "`r`n`r`nEnd time: $($timestamp)"

    Stop-Transcript
    Stop-SPAssignment -global
}