#!/usr/bin/env bash

# 当发生错误时中止脚本
set -e

# 拉取代码
# git pull

# 获取用户输入
read -p "请输入您要构建的环境变量(staging/prod,默认prod): " env
env=${env:-prod}

read -p "请输入您要上传的服务器别名(默认：azureuser@20.38.175.198): " server
server=${server:-azureuser@20.38.175.198}

read -p "请输入您要上传的服务器位置(默认：/var/www/): " remote_path
remote_path=${remote_path:-/var/www/}

read -p "请输入您在远程部署的文件夹名称（默认：gamerboom-web）: " folder_name
folder_name=${folder_name:-gamerboom-web}

echo -e " 编译压缩文件，生成dist文件夹... "
npm run build:${env}

echo -e " 要将$(pwd)/dist文件夹上传到服务器"

# 首先在远程服务器创建必要的目录
ssh -p 22222 ${server} "mkdir -p ${remote_path}${folder_name}.tmp"

# 上传文件到临时目录
echo -e " 执行命令scp -P 22222 -r $(pwd)/dist/* ${server}:${remote_path}${folder_name}.tmp/"
scp -P 22222 -r $(pwd)/dist/* ${server}:${remote_path}${folder_name}.tmp/

if [ $? -eq 0 ]; then
    # 登录服务器执行部署
    ssh -p 22222 -Tq ${server} <<remotessh
    # 删除旧的备份
    rm -rf ${remote_path}${folder_name}.bak.*
    # 将当前版本移动为备份
    if [ -d "${remote_path}${folder_name}" ]; then
        mv ${remote_path}${folder_name} ${remote_path}${folder_name}.bak.$(date '+%Y%m%d%H%M%S')
    fi
    # 将新版本移动到正式目录
    mv ${remote_path}${folder_name}.tmp ${remote_path}${folder_name}
    exit;
remotessh
    # 添加部署完成时间
    echo -e "\n✅ 部署完成! 完成时间: $(date '+%Y-%m-%d %H:%M:%S')"
else
    echo -e "\n❌ 部署失败，请检查错误信息"
    exit 1
fi
