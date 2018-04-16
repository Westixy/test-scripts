#!/bin/bash
if [[ -z "${CPNV_USERNAME}" ]]; then
  echo You can define CPNV_USERNAME to avoid this step
  echo -n 'Username: '  
  read username
else
  username="${CPNV_USERNAME}"
  echo "Username: $username"
fi
echo -n 'Password: ' 
read -s password
echo

wget -q --no-check-certificate https://intranet.cpnv.ch/connexion -O /tmp/tmp.html

basefile=`cat /tmp/tmp.html`
[[ $basefile =~ name\=\"authenticity_token\"\ type\=\"hidden\"\ value\=\"(.{20,50})\" ]] &&
    auth_token=${BASH_REMATCH[1]} || echo 'auth token not found'
rm /tmp/tmp.html

urlencode() {
    # urlencode <string>
    old_lc_collate=$LC_COLLATE
    LC_COLLATE=C
    
    local length="${#1}"
    for (( i = 0; i < length; i++ )); do
        local c="${1:i:1}"
        case $c in
            [a-zA-Z0-9.~_-]) printf "$c" ;;
            *) printf '%%%02X' "'$c" ;;
        esac
    done
    
    LC_COLLATE=$old_lc_collate
}
username=`urlencode $username`
password=`urlencode $password`
auth_token=`urlencode $auth_token`

postdata="_utf8=%E2%98%83&authenticity_token=$auth_token&user_session%5Bemail%5D=$username&user_session%5Bpassword%5D=$password&user_session%5Bremember_me%5D=0&commit=Connexion"

wget --post-data $postdata -q --no-check-certificate https://intranet.cpnv.ch/connexion -O /tmp/tmp.html
resfile=`cat /tmp/tmp.html`
rm /tmp/tmp.html
[[ $resfile =~ href\=\"\/deconnexion\" ]] &&
    echo 'OK ! you are connected' || echo 'check credentials (not connected)'
