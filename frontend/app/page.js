import LikeButton from './like-button';

function Header({ title }) {
  return <h1>{title || 'Default title'}</h1>;
}

export default function HomePage() {
  const names = ['Jose Felipe', 'Fernando Ruan', 'Jonas',
		 'Felipe Nasser', 'Senji'];

    return (
	    <html>
	    <body>
	    <div>
	    <Header title='Inimigos do Pace' />
	  <ul>
	  {names.map((name) => (
		  <li key={name}>{name}</li>
		  ))}
      </ul>
	  <LikeButton />
	    </div>
	    </body>
	    </html>
	  );
}
