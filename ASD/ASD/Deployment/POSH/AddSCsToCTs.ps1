param(
    [ValidateSet("Dev","Test","Prod")]
    [parameter(mandatory=$true)]
    [string]$Environment = ("Dev","Test","Prod")
)

$path = (Get-Location).Path
$timestamp = Get-Date

if ((Get-PSSnapin "Microsoft.SharePoint.PowerShell" -ErrorAction SilentlyContinue) -eq $null) 
{
    Add-PSSnapin "Microsoft.SharePoint.PowerShell"
}

Start-SPAssignment -global
Start-Transcript -Path "$($path)\AddSCsToCTs.log" -Force


$hostName = $env:COMPUTERNAME
$Environments = @{
     "DEV" =
    @{
       "WebAppUrl" = "https://$($hostName).ferc.gov"
       "WebSiteUrl" = "https://$($hostName).ferc.gov/asd"
     }
    "TEST" = 
    @{
        "WebAppUrl" = "https://test.sp.ferc.gov/"
        "WebSiteUrl" = "https://test.sp.ferc.gov/asd"
     }
     "PROD" = 
     @{
      "WebAppUrl" = "https://sp.ferc.gov/"
      "WebSiteUrl" = "https://sp.ferc.gov/asd"
     }
}

$webSiteUrl = $Environments.Get_Item($Environment).WebSiteUrl;

Write-Output "Start time: $($timestamp)"
Write-Output "Adding SCs to CTs: $($WebSiteUrl)`r`n"

try {
    $web = Get-SPWeb $webSiteUrl
    
    Write-Output "Adding new field to ASD Base Content Type."    
    $newFieldSchema = '<Field Type="Boolean" DisplayName="SysIsAwarded" EnforceUniqueValues="FALSE" Indexed="FALSE" ID="{34f43612-3830-4750-9457-86bb7b7cfbfd}" StaticName="SysIsAwarded" Name="SysIsAwarded" Group="ASD"><Default>0</Default></Field>'
    $web.Fields.AddFieldAsXml($newFieldSchema) | Out-Null
    $web.update()
    
    $field = $web.Fields["SysIsAwarded"] | Out-Null
    $ctName = "ASD Base"
    $link = new-object Microsoft.SharePoint.SPFieldLink $field
    $ct = $web.ContentTypes[$ctName]
    $ct.FieldLinks.Add($link)
    $ct.Update($true)
    Write-Output "New field SysIsAwarded was added to ASD Base Content Type."

    $scs = @("Funding", "Notice of Intent", "Recompete Package")
    $cts = @("Product", "Product With Incidental Services", "Services", "BPA Call Or Task Delivery Order", "Exercising an Option Year")

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
} catch [system.exception] {
    Write-Output $_.Exception.Message
} finally {
    $timestamp = Get-Date
    Write-Output "`r`n`r`nEnd time: $($timestamp)"

    Stop-Transcript
    Stop-SPAssignment -global
}