param(
    [ValidateSet("DEV","TEST","PROD")]
    [parameter(mandatory=$true)]
    [string]$Environment = ("DEV","TEST","PROD")
)

$timestamp = Get-Date
$path = (Get-Location).Path
$hostName = $env:COMPUTERNAME

Start-Transcript -Path "$($path)\Backup-SQL.log" -Force

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

function backupContentDB() {
    Write-Output "Backing up ASD Content DB..."

    $instance = $Environments.Get_Item($Environment).SQLInstance;
    $localPath = $Environments.Get_Item($Environment).SQLBackupDir;
    $dbName = $Environments.Get_Item($Environment).DBName;
    $backupFilePath = $localPath + "\" + $dbName + ".bak"

    Backup-SqlDatabase -ServerInstance $instance -Database $dbName -BackupAction Database -BackupFile $backupFilePath -Compression On -Initialize
    Write-Output "Backup of ASD Content DB is complete."
}

function spacer() {
    Write-Host "`r`n******************************`r`n"
}

try {
    Write-Output "Start time: $($timestamp)"
    
    spacer

    backupContentDB

    spacer
} catch [system.exception] {
    Write-Output $_.Exception.Message
} finally {
    $timestamp = Get-Date
    Write-Output "`r`n`r`nEnd time: $($timestamp)"

    Stop-Transcript
}