export interface LoginFormProps {
  onSubmit?: () => void
  onGithubSignIn?: () => void
  loading?: boolean
  onCredentialsSignIn?: (data: { username: string; password: string }) => void
}
