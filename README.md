Déploiement d’une plateforme web avec Apache, Node.js, PostgreSQL et GitLab CI/CD

> [!important]
> Ce README regroupe dans un seul document la mise en place :
>
> - d’un site web servi par Apache ;
> - de plusieurs sous-chemins publics ;
> - d’un backend Node.js conteneurisé ;
> - d’une base PostgreSQL conteneurisée ;
> - d’un déploiement automatique via GitLab CI/CD.

1. Principes d’anonymisation
   Les éléments réels ont été remplacés par des valeurs génériques :
   domaine public : `example.com`
   sous-domaine : `www.example.com`
   IP publique : `X.X.X.X`
   racine web : `/var/www/project`
   dépôt : `my_project`
   réseau Docker : `app-net`
   conteneur backend : `app-node`
   image backend : `project/node-app`
   conteneur PostgreSQL : `app-postgres`
   volume PostgreSQL : `app-postgres-data`
   base de données : `appdb`
   utilisateur PostgreSQL : `appuser`
   variable CI/CD du mot de passe : `APP_POSTGRES_PASSWORD`
   > [!warning]
   > Avant mise en production, remplace toutes les valeurs d’exemple par les tiennes.

---

2. Architecture cible
   Exposition publique
   site principal : `https://example.com/`
   sous-chemins :
   `https://example.com/site-1/`
   `https://example.com/site-2/`
   `https://example.com/site-3/`
   `https://example.com/dashboard/`
   `https://example.com/fullrecolt/`
   backend exposé via reverse proxy :
   `https://example.com/api/`
   Services internes
   Apache sert les contenus statiques et relaie `/api/` vers le backend Node.js
   le backend Node.js écoute en local sur `127.0.0.1:3000`
   PostgreSQL est accessible uniquement sur le réseau Docker interne
   GitLab CI/CD déploie automatiquement le frontend, le backend et la base

---

3. Arborescence du projet
   Structure visée :

```text
my_project/
├── backend/
│   ├── Dockerfile
│   └── .dockerignore
├── dashboard/
├── fullrecolt/
├── root/
├── site-1/
├── site-2/
├── site-3/
├── .gitlab-ci.yml
└── README.md
```

> [!info]
> Git ne versionne pas les dossiers vides. Ajoute un fichier `.gitkeep` si nécessaire.

---

4. Préparer l’arborescence web sur le serveur
   Créer les répertoires qui seront servis par Apache :

```bash
sudo mkdir -p \
/var/www/project/root \
/var/www/project/site-1 \
/var/www/project/site-2 \
/var/www/project/site-3 \
/var/www/project/dashboard \
/var/www/project/fullrecolt
```

Vérifier :

```bash
ls -la /var/www/project
```

---

5. Installer et préparer Apache
   Installer Apache :

```bash
sudo apt update
sudo apt install -y apache2
```

Vérifier le service :

```bash
sudo systemctl status apache2 --no-pager
```

Définir un `ServerName` global :

```bash
echo 'ServerName example.com' | sudo tee /etc/apache2/conf-available/servername.conf
sudo a2enconf servername
sudo systemctl reload apache2
sudo apache2ctl configtest
```

Activer les modules utiles :

```bash
sudo a2enmod rewrite alias headers proxy proxy_http ssl
sudo systemctl reload apache2
sudo apache2ctl -M | grep -E 'rewrite|alias|headers|proxy|proxy_http|ssl'
```

---

6. Configurer le virtual host HTTP
   Créer le vhost HTTP :

```bash
sudo tee /etc/apache2/sites-available/project.conf > /dev/null <<'EOF'
<VirtualHost *:80>
    ServerName example.com
    ServerAlias www.example.com

    DocumentRoot /var/www/project/root

    <Directory /var/www/project/root>
        Options FollowSymLinks
        AllowOverride None
        Require all granted
    </Directory>

    Alias /site-1 /var/www/project/site-1
    <Directory /var/www/project/site-1>
        Options FollowSymLinks
        AllowOverride None
        Require all granted
    </Directory>

    Alias /site-2 /var/www/project/site-2
    <Directory /var/www/project/site-2>
        Options FollowSymLinks
        AllowOverride None
        Require all granted
    </Directory>

    Alias /site-3 /var/www/project/site-3
    <Directory /var/www/project/site-3>
        Options FollowSymLinks
        AllowOverride None
        Require all granted
    </Directory>

    Alias /dashboard /var/www/project/dashboard
    <Directory /var/www/project/dashboard>
        Options FollowSymLinks
        AllowOverride None
        Require all granted
    </Directory>

    Alias /fullrecolt /var/www/project/fullrecolt
    <Directory /var/www/project/fullrecolt>
        Options FollowSymLinks
        AllowOverride None
        Require all granted
    </Directory>

    ErrorLog ${APACHE_LOG_DIR}/project_error.log
    CustomLog ${APACHE_LOG_DIR}/project_access.log combined
</VirtualHost>
EOF
```

Activer le site :

```bash
sudo a2ensite project.conf
sudo a2dissite 000-default.conf
sudo apache2ctl configtest
sudo systemctl reload apache2
```

> [!warning]
> Ne pas activer `Indexes` si tu ne veux pas exposer le contenu des dossiers sans `index.html`.

---

7. Pointer le domaine et ouvrir le pare-feu
   Récupérer l’IP publique du serveur :

```bash
curl -4 ifconfig.me
```

Créer les enregistrements DNS chez le registrar :

```text
A    example.com       X.X.X.X
A    www.example.com   X.X.X.X
```

Vérifier la résolution DNS :

```bash
sudo apt install -y dnsutils
dig +short example.com
dig +short www.example.com
```

Autoriser HTTP et HTTPS :

```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw status verbose
```

---

8. Activer HTTPS avec Let’s Encrypt
   Installer Certbot :

```bash
sudo apt update
sudo apt install -y certbot python3-certbot-apache
certbot --version
```

Demander le certificat :

```bash
sudo certbot --apache -d example.com -d www.example.com
```

Choisir la redirection HTTP vers HTTPS lorsque proposé.
Vérifier :

```bash
curl -I http://example.com
curl -I https://example.com
```

Comportement attendu :
`http://example.com` redirige en `301` vers `https://example.com`
`https://example.com` répond en `200 OK`
Ajouter HSTS dans le vhost SSL :

```apache
Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"
```

Recharger Apache :

```bash
sudo apache2ctl configtest
sudo systemctl reload apache2
```

---

9. Préparer le runner GitLab
   Vérifier la configuration du runner :

```bash
sudo grep -nE '^\s*\[\[runners\]\]|name =|executor =|user =|builds_dir =|cache_dir =|volumes =|image =' /etc/gitlab-runner/config.toml
```

Exemple de configuration utile :

```toml
[runners.docker]
  image = "debian:13"
  volumes = ["/cache", "/var/www/project:/var/www/project", "/var/run/docker.sock:/var/run/docker.sock"]
```

Redémarrer le runner :

```bash
sudo systemctl restart gitlab-runner
sudo gitlab-runner verify
```

> [!warning]
> Le montage de `/var/run/docker.sock` donne aux jobs CI un accès direct au Docker de l’hôte. À réserver à un runner de confiance.

---

10. Préparer le backend Node.js
    Créer `backend/Dockerfile` :

```dockerfile
FROM node:22-alpine

WORKDIR /app

COPY . .

EXPOSE 3000

CMD ["node", "-e", "require('http').createServer((req,res)=>{res.writeHead(200,{'Content-Type':'application/json'});res.end(JSON.stringify({status:'ok',service:'app-node'}));}).listen(3000,'0.0.0.0')"]
```

Créer `backend/.dockerignore` :

```dockerignore
node_modules
npm-debug.log
yarn-error.log
.git
.gitignore
Dockerfile
.dockerignore
```

Créer le réseau Docker dédié :

```bash
sudo docker network create app-net
sudo docker network ls | grep app-net
```

---

11. Préparer PostgreSQL
    Créer le volume persistant :

```bash
sudo docker volume create app-postgres-data
sudo docker volume ls | grep app-postgres-data
```

Créer la variable CI/CD dans GitLab :

```text
Key: APP_POSTGRES_PASSWORD
Value: <mot de passe fort>
Type: Variable
```

Options recommandées :
`Masked` : activé
`Protected` : activé si la branche `main` est protégée

> [!warning]
> Le mot de passe ne doit jamais être stocké dans le dépôt Git.

---

12. Pipeline GitLab CI/CD complète
    Créer le fichier `.gitlab-ci.yml` :

```yaml
stages:
   - deploy_infra
   - deploy

deploy_static:
   stage: deploy
   image: debian:13
   tags:
      - docker
   before_script:
      - apt-get update
      - apt-get install -y rsync
   script:
      - rsync -av --delete root/ /var/www/project/root/
      - rsync -av --delete site-1/ /var/www/project/site-1/
      - rsync -av --delete site-2/ /var/www/project/site-2/
      - rsync -av --delete site-3/ /var/www/project/site-3/
      - rsync -av --delete dashboard/ /var/www/project/dashboard/
      - rsync -av --delete fullrecolt/ /var/www/project/fullrecolt/
   rules:
      - if: '$CI_COMMIT_BRANCH == "main"'

deploy_postgres:
   stage: deploy_infra
   image: docker:cli
   tags:
      - docker
   script:
      - docker rm -f app-postgres || true
      - docker run -d --restart unless-stopped \
        --name app-postgres \
        --network app-net \
        -e POSTGRES_DB=appdb \
        -e POSTGRES_USER=appuser \
        -e POSTGRES_PASSWORD="$APP_POSTGRES_PASSWORD" \
        -v app-postgres-data:/var/lib/postgresql/data \
        postgres:17
   rules:
      - if: '$CI_COMMIT_BRANCH == "main"'
        changes:
           - .gitlab-ci.yml

deploy_backend:
   stage: deploy
   image: docker:cli
   tags:
      - docker
   script:
      - docker build -t project/node-app ./backend
      - docker rm -f app-node || true
      - docker run -d --restart unless-stopped \
        --name app-node \
        --network app-net \
        -p 127.0.0.1:3000:3000 \
        -e DB_HOST=app-postgres \
        -e DB_PORT=5432 \
        -e DB_NAME=appdb \
        -e DB_USER=appuser \
        -e DB_PASSWORD="$APP_POSTGRES_PASSWORD" \
        project/node-app
   rules:
      - if: '$CI_COMMIT_BRANCH == "main"'
        changes:
           - backend/**/*
           - .gitlab-ci.yml
```

Pousser la pipeline :

```bash
git add .gitlab-ci.yml backend/Dockerfile backend/.dockerignore
git commit -m "Add deployment pipeline"
git push
```

---

13. Configurer Apache pour exposer le backend
    Dans le vhost SSL, ajouter le reverse proxy :

```apache
ProxyPreserveHost On
ProxyPass /api/ http://127.0.0.1:3000/
ProxyPassReverse /api/ http://127.0.0.1:3000/
```

Exemple complet :

```bash
sudo tee /etc/apache2/sites-available/project-le-ssl.conf > /dev/null <<'EOF'
<IfModule mod_ssl.c>
<VirtualHost *:443>
    ServerName example.com
    ServerAlias www.example.com

    DocumentRoot /var/www/project/root

    ProxyPreserveHost On
    ProxyPass /api/ http://127.0.0.1:3000/
    ProxyPassReverse /api/ http://127.0.0.1:3000/

    <Directory /var/www/project/root>
        Options FollowSymLinks
        AllowOverride None
        Require all granted
    </Directory>

    Alias /site-1 /var/www/project/site-1
    <Directory /var/www/project/site-1>
        Options FollowSymLinks
        AllowOverride None
        Require all granted
    </Directory>

    Alias /site-2 /var/www/project/site-2
    <Directory /var/www/project/site-2>
        Options FollowSymLinks
        AllowOverride None
        Require all granted
    </Directory>

    Alias /site-3 /var/www/project/site-3
    <Directory /var/www/project/site-3>
        Options FollowSymLinks
        AllowOverride None
        Require all granted
    </Directory>

    Alias /dashboard /var/www/project/dashboard
    <Directory /var/www/project/dashboard>
        Options FollowSymLinks
        AllowOverride None
        Require all granted
    </Directory>

    Alias /fullrecolt /var/www/project/fullrecolt
    <Directory /var/www/project/fullrecolt>
        Options FollowSymLinks
        AllowOverride None
        Require all granted
    </Directory>

    ErrorLog ${APACHE_LOG_DIR}/project_error.log
    CustomLog ${APACHE_LOG_DIR}/project_access.log combined

    Include /etc/letsencrypt/options-ssl-apache.conf
    SSLCertificateFile /etc/letsencrypt/live/example.com/fullchain.pem
    SSLCertificateKeyFile /etc/letsencrypt/live/example.com/privkey.pem
    Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"
</VirtualHost>
</IfModule>
EOF
```

Vérifier puis recharger :

```bash
sudo apache2ctl configtest
sudo systemctl reload apache2
```

---

14. Vérifications de fonctionnement
    Backend local

```bash
curl http://127.0.0.1:3000
```

Résultat attendu :

```json
{"status": "ok", "service": "app-node"}
```

Backend public via Apache

```bash
curl https://example.com/api/
```

Résultat attendu :

```json
{"status": "ok", "service": "app-node"}
```

État du conteneur backend

```bash
sudo docker inspect -f 'name={{.Name}} status={{.State.Status}} restart={{.HostConfig.RestartPolicy.Name}}' app-node
```

État du conteneur PostgreSQL

```bash
sudo docker inspect -f 'name={{.Name}} status={{.State.Status}} restart={{.HostConfig.RestartPolicy.Name}}' app-postgres
```

PostgreSQL prêt

```bash
sudo docker exec app-postgres pg_isready -U appuser -d appdb
```

Variables d’environnement injectées dans le backend

```bash
sudo docker exec app-node env | grep '^DB_'
```

Résultat attendu :

```text
DB_HOST=app-postgres
DB_PORT=5432
DB_NAME=appdb
DB_USER=appuser
DB_PASSWORD=<valeur injectée par GitLab>
```

Test réseau backend → PostgreSQL

```bash
sudo docker exec app-node node -e "const net=require('net'); const s=net.createConnection({host:'app-postgres',port:5432},()=>{console.log('OK'); s.end();}); s.on('error',e=>{console.error('ERR',e.message); process.exit(1);});"
```

Test d’authentification PostgreSQL

```bash
sudo docker run --rm --network app-net -e PGPASSWORD='your_strong_password' postgres:17 psql -h app-postgres -U appuser -d appdb -c '\conninfo'
```

---

15. Contrat d’intégration backend
    Variables à transmettre au développeur :

```text
DB_HOST=app-postgres
DB_PORT=5432
DB_NAME=appdb
DB_USER=appuser
DB_PASSWORD=<fourni côté infra, ne pas hardcoder>
```

Contraintes d’intégration :

```text
- Le backend tourne dans un conteneur sur un réseau Docker interne.
- PostgreSQL est joignable via son nom Docker.
- Le port PostgreSQL n’est pas exposé publiquement.
- Les variables DB_* sont injectées par la CI/CD.
- Toute nouvelle variable applicative doit être ajoutée côté GitLab CI/CD.
```

---

16. Résultat attendu
    À la fin, l’infrastructure permet :
    de servir plusieurs pages statiques sous un même domaine ;
    de sécuriser l’accès public en HTTPS ;
    d’exposer un backend Node.js via `/api/` ;
    d’utiliser PostgreSQL sans exposition publique ;
    de déployer automatiquement les composants via GitLab CI/CD.
