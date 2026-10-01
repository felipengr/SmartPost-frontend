import { Alert, Platform } from 'react-native';

// Pergunta "tem certeza?" antes de uma ação. No navegador o Alert com botões não
// funciona (react-native-web), então lá usa o confirm do próprio navegador.
export function confirmar(
  titulo: string,
  texto: string,
  rotuloDaAcao: string,
  acao: () => void,
  destrutiva = false,
) {
  if (Platform.OS === 'web') {
    if (window.confirm(`${titulo}\n\n${texto}`)) acao();
    return;
  }
  Alert.alert(titulo, texto, [
    { text: 'Cancelar', style: 'cancel' },
    { text: rotuloDaAcao, style: destrutiva ? 'destructive' : 'default', onPress: acao },
  ]);
}
