import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';

// Mesmo limite que a API aplica no Cloudinary: acima disso é só peso a mais no envio
const LADO_MAXIMO = 1600;

// Reduz a foto da câmera antes de enviar: celulares modernos tiram fotos que passam
// do limite de 5 MB da API, e um arquivo menor sobe mais rápido no 4G
export async function prepararFoto(uri: string) {
  const original = await ImageManipulator.manipulate(uri).renderAsync();
  const { width, height } = original;

  const contexto = ImageManipulator.manipulate(uri);
  if (Math.max(width, height) > LADO_MAXIMO) {
    contexto.resize(width >= height ? { width: LADO_MAXIMO } : { height: LADO_MAXIMO });
  }
  const pronta = await contexto.renderAsync();
  const salva = await pronta.saveAsync({ format: SaveFormat.JPEG, compress: 0.7 });
  return salva.uri;
}
