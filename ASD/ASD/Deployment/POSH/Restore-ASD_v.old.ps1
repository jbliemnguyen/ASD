param(
    [ValidateSet("DEV","TEST","PROD")]
    [parameter(mandatory=$true)]
    [string]$Environment = ("DEV","TEST","PROD")
)

$timestamp = Get-Date
$path = (Get-Location).Path
$hostName = $env:COMPUTERNAME

Start-Transcript -Path "$($path)\Restore-ASD.log" -Force

Import-Module “sqlps” -DisableNameChecking

$Environments = @{
     "DEV" =
    @{
       "WebAppUrl" = "https://$($hostName).ferc.gov"
       "WebSiteUrl" = "https://$($hostName).ferc.gov/asd"
       "SQLInstance" = "SPSQL"
       "SQLBackupDir" = "F:\SQLBackups"
       "DBName" = "WFED1_Content_ASD"
     }
    "TEST" = 
    @{
        "WebAppUrl" = "https://test.sp.ferc.gov/"
        "WebSiteUrl" = "https://test.sp.ferc.gov/asd"
        "SQLInstance" = "FDC1S-SP23SQLT1"
        "SQLBackupDir" = "F:\SQLBackup"
        "DBName" = "SPTEST_Content_ASD"
     }
     "PROD" = 
     @{
      "WebAppUrl" = "https://sp.ferc.gov/"
      "WebSiteUrl" = "https://sp.ferc.gov/asd"
      "SQLInstance" = "FDC1S-SP23SQLP1"
      "SQLBackupDir" = "F:\SQLBackups"
      "DBName" = "FERC_Content_ASD"
     }
}

$sqlPath = $Environments.Get_Item($Environment).SQLBackupDir;
$dbName = $Environments.Get_Item($Environment).DBName
$restoreFilePath = $sqlPath + "\" + $dbName + ".bak"
$instance = $Environments.Get_Item($Environment).SQLInstance;
$sqlAlias = "SPSQL"
$webApplication = $Environments.Get_Item($Environment).WebAppUrl

Start-Transcript -Path "$path\Restore-ASD.log" -Force
Write-Output "Start time: $($timestamp)`r`n`r`n"

try {
    Write-Output "Restoring ASD DB..."

    Remove-SPContentDatabase $dbName -Confirm:$false -force

    Restore-SqlDatabase -ServerInstance $instance -Database $dbName -BackupFile $restoreFilePath
    
    Mount-SPContentDatabase $dbName -DatabaseServer $sqlAlias -WebApplication $webApplication
    
    Write-Output "Restore finished."
} catch [system.exception] {
    Write-Output "!!!!!!!!!!!!!!!!! ERROR !!!!!!!!!!!!!!!!!"
    Write-Output $_.Exception.Message
    Write-Output "!!!!!!!!!!!!!!!!! ERROR !!!!!!!!!!!!!!!!!"
} finally {
    $timestamp = Get-Date
    Write-Output "`r`n`r`nEnd time: $($timestamp)"

    Stop-Transcript
}