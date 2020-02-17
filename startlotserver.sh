#!/bin/bash
LANG=en_US.UTF-8
XDG_SESSION_ID=3
USER=root
PWD=/root
HOME=/root
MAIL=/var/mail/root
TERM=linux
SHELL=/bin/bash
SHLVL=1
LOGNAME=root
XDG_RUNTIME_DIR=/run/user/0
PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
_=/usr/bin/env


startlotserver(){
	apt-get update
	apt-get install ethtool
	bash <(wget --no-check-certificate -qO- https://raw.githubusercontent.com/HarryYC/WebGame/master/activelotserver.sh) install
	sed -i '/advinacc/d' /appex/etc/config
	sed -i '/maxmode/d' /appex/etc/config
	echo -e "advinacc=\"1\"
maxmode=\"1\"">>/appex/etc/config
	/appex/bin/lotServer.sh restart
}

startlotserver
