# Generar private key y certificate (*.pem)

## Private Key

```
openssl genrsa -out MyPrivateKey.key 2048
```

## CSR (its not a certificate)

```
openssl req -new -key MiPrivateKey.key -subj
"/C=AR/O=Empresa/CN=Servicio/serialNumber=CUIT nnnnnnnnnn" -out
MiPedidoCSR.csr
```