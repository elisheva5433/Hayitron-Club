$repo = "c:\proj"
# copy to temp ascii path to avoid hebrew terminal issues
if (!(Test-Path $repo)) {
    cmd /c mklink /J c:\proj "c:\פרויקט מועדון היתרון"
}
Set-Location $repo
git add -A
git commit -m "feat: branding, splash, new businesses, website URLs, logo updates"
git push
