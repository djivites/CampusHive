import Sidebar from './Sidebar';
import Navbar from './Navbar';

const MainLayout = ({ children }) => {
  return (
    <div className="d-flex min-vh-100" style={{ backgroundColor: '#020617', color: 'white' }}>
      <Sidebar />
      <div className="flex-grow-1 d-flex flex-column" style={{ marginLeft: '280px' }}>
        <Navbar />
        <main className="p-4 p-md-5">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
