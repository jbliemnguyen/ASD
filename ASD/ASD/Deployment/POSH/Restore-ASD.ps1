param(
    [ValidateSet("DEV","TEST","PROD")]
    [parameter(mandatory=$true)]
    [string]$Environment = ("DEV","TEST","PROD")
)

$timestamp = Get-Date
$path = (Get-Location).Path
$hostName = $env:COMPUTERNAME

Start-Transcript -Path "$($path)\Restore-ASD.log" -Force
Start-SPAssignment -global
Write-Output "Start time: $($timestamp)`r`n`r`n"

$Environments = @{
     "DEV" =
    @{
        "WebAppUrl" = "https://$($hostName).ferc.gov"
        "WebSiteUrl" = "https://$($hostName).ferc.gov/asd"
        "SQLServerName" = "fdc1s-sp23sqld1"
        "SQLInstance" = "SPSQL"
        "SQLBackupDir" = "F:\SQLBackups"
        "DBName" = "WFED1_Content_ASD"
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


try {
    Write-Output "Restoring ASD DB..."

    $date = Get-Date -Format 'yyyy-MM-dd'
    # $ticks = $date.Ticks

    $instance = $Environments.Get_Item($Environment).SQLInstance;
    $localPath = $Environments.Get_Item($Environment).SQLBackupDir
    $dbName = $Environments.Get_Item($Environment).DBName
    $backupFilePath = $localPath + "\" + $dbName + "_" + $date + ".bak"
    $webApplication = $Environments.Get_Item($Environment).WebAppUrl


    Remove-SPContentDatabase $dbName -Confirm:$false -Force -ErrorAction SilentlyContinue
    Write-Output "Removal of existing content database has completed."

    $SQLConn = New-Object System.Data.SQLClient.SQLConnection
    $SQLConn.ConnectionString = "Server=" + $instance + "; Trusted_Connection=True"
    $SQLConn.Open()
    
    $SQLCmd = New-Object System.Data.SQLClient.SQLCommand
    $SQLCmd = $SQLConn.CreateCommand()
    $SQLCmd.commandtimeout=0
    $SQLCmd.CommandText="RESTORE DATABASE $dbName FROM DISK = '$backupFilePath'"
    $SQLCmd.Executenonquery() | out-null
    Write-Output "Restore of content database has completed."

    Mount-SPContentDatabase $dbName -DatabaseServer $instance -WebApplication $webApplication
    Write-Output "Mounting of content database has completed."

    Write-Output "Restore finished."
} catch [system.exception] {
    Write-Output "!!!!!!!!!!!!!!!!! ERROR !!!!!!!!!!!!!!!!!"
    Write-Output $_.Exception.Message
    Write-Output "!!!!!!!!!!!!!!!!! ERROR !!!!!!!!!!!!!!!!!"
} finally {
    $timestamp = Get-Date
    Write-Output "`r`n`r`nEnd time: $($timestamp)"

    Stop-SPAssignment -global
    Stop-Transcript
}