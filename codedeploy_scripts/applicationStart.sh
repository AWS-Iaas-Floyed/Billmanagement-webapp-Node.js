cd /etc/profile.d

env

FILE=userdata.sh
while ! test -f "$FILE"; do
    sleep 30s
    echo "$FILE not exist"
done

sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -a fetch-config -m ec2 -c file:/home/ubuntu/cloudwatch-config.json -s

cd /home/ubuntu
sudo runuser -l ubuntu -c 'pm2 stop index'
sudo npm install
sudo npm install pm2 -g -f
sudo runuser -l ubuntu -c 'pm2 start index.js'
