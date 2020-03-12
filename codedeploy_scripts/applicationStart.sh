cd /etc/profile.d

env

FILE=userdata.sh
while ! test -f "$FILE"; do
    sleep 30s
    echo "$FILE not exist"
done

cd /home/ubuntu
sudo npm install
sudo node index.js