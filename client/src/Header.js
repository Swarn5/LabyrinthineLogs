import {Link} from "react-router-dom";

export default function Header() {
    return(
        <header>
        <Link to="/" className="logo">LabyrinthineLogs</Link>
        <nav>
          <Link to="/login">Login</Link>
          <Link to="/register">register</Link>
        </nav>
      </header>
    );
}