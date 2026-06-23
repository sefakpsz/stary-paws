import { AuthModal, CreateModal, ProfileModal } from "./modals";
import { useAppLanguage } from "../hooks/useAppLanguage";
import { useAppTheme } from "../hooks/useAppTheme";
import { useAuthState } from "../hooks/useAuthState";

export function AppModals({
  onPostSubmitted,
}: {
  onPostSubmitted?: () => void;
}) {
  const { t } = useAppLanguage();
  const { styles, theme } = useAppTheme();
  const {
    closeAuth,
    closeCreate,
    closeProfile,
    createType,
    showAuth,
    showProfile,
    signIn,
    signOut,
  } = useAuthState();

  return (
    <>
      <AuthModal
        visible={showAuth}
        onClose={closeAuth}
        onSignIn={signIn}
        styles={styles}
        t={t}
        theme={theme}
      />

      <CreateModal
        visible={Boolean(createType)}
        type={createType}
        onClose={closeCreate}
        onSubmitted={onPostSubmitted}
        styles={styles}
        t={t}
        theme={theme}
      />

      <ProfileModal
        visible={showProfile}
        onClose={closeProfile}
        onSignOut={signOut}
        styles={styles}
        t={t}
        theme={theme}
      />
    </>
  );
}
