const siteConfig = {
  title: "Ferretería el Palomar",
  description: "Gestión de productos e inventario.",
};

export default function Home() {
  return (
    <div className="container mx-auto px-8 py-10" >
      <h1 className="text-5xl font-bold">{siteConfig.title}</h1>
      <p className="text-muted-foreground mt-6 text-lg">{siteConfig.description}</p>
    </div>
  );
}
