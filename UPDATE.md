### .env
(Client)
```
//.env.local
NEXT_PUBLIC_FASTAPI_URL=
```
(Server)
```
//.env
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
REDIRECT_URL=
```

### Security
(Client) ใช้ getServerSideProps สำหรับปกป้องกันการเจข้าถึงหน้าต่างๆ
(Server) เพิ่ม api check token ป้องกันเข้าหน้าต่างๆ

### Performance
(Server) ใช้ Cachetools สำหรับการแคชข้อมูลต่างๆ
