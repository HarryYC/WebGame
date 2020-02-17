startlotserver(){
	apt-get update
	apt-get install ethtool
	bash <(wget --no-check-certificate -qO- https://raw.githubusercontent.com/chiakge/lotServer/master/Install.sh) install
	sed -i '/advinacc/d' /appex/etc/config
	sed -i '/maxmode/d' /appex/etc/config
	echo -e "advinacc=\"1\"
maxmode=\"1\"">>/appex/etc/config
	/appex/bin/lotServer.sh restart
}

startlotserver
