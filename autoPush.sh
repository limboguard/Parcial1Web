if [ $# -eq 0 ]
then
  read -p "Commit message: " -r
  git add -A
  git commit -m "\"${REPLY}\""
  git push
else
  git add -A
  git commit -m "\"${1}\""
  git push
fi
