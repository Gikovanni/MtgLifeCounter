import { IonContent, IonPage } from '@ionic/react';
import { HomeScreen } from './features/app/HomeScreen';
import { AppProvider } from './state/AppContext';

function App() {
  return (
    <AppProvider>
      <IonPage>
        <IonContent fullscreen>
          <HomeScreen />
        </IonContent>
      </IonPage>
    </AppProvider>
  );
}

export default App;
