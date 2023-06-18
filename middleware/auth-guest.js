export default function ({ app, redirect }) {
  // Check if the user is authenticated
  if (app.$auth.loggedIn) {
    // If the user is authenticated, redirect them to the dashboard
    return redirect('/furniture-list');
  }
}
