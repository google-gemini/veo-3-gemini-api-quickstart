$p1 = "d:\AIgnite\AIG-POCs\PhotoAIG\PhotoAIG\public\prompt.json"
$j1 = Get-Content $p1 -Raw | ConvertFrom-Json
foreach ($i in $j1) {
    if (-not $i.PSObject.Properties['alias']) {
        $i | Add-Member -MemberType NoteProperty -Name "alias" -Value $i.label
    }
}
$j1 | ConvertTo-Json -Depth 10 | Set-Content $p1

$p2 = "d:\AIgnite\AIG-POCs\PhotoAIG\PhotoAIG\public\prompt-album.json"
$j2 = Get-Content $p2 -Raw | ConvertFrom-Json
foreach ($a in $j2) {
    foreach ($i in $a.images) {
        if (-not $i.PSObject.Properties['alias']) {
            $i | Add-Member -MemberType NoteProperty -Name "alias" -Value $i.label
        }
    }
}
$j2 | ConvertTo-Json -Depth 10 | Set-Content $p2
