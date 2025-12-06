import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import * as api from '../api';
import { Product, Auction, PartCategory, User, AdminMessage, SiteSettings, ServiceInfo, Testimonial, LiftRentalBooking, FooterLink, AuditLogEntry, Contact, ServicePageSettings } from '../types';
import { Link, useNavigate } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import Modal from '../components/Modal';

type AdminTab = 'dashboard' | 'products' | 'auctions' | 'users' | 'liftManagement' | 'messaging' | 'addressBook' | 'settings' | 'audit';
type ServicePageTab = 'repairs' | 'maintenance' | 'tires' | 'vhu';

const StatCard: React.FC<{ title: string; value: string | number; icon: string; }> = ({ title, value, icon }) => (
    <div className="bg-white p-6 rounded-lg shadow-md flex items-center animate-fade-in-up">
        <div className="bg-expert-green text-white rounded-full h-16 w-16 flex items-center justify-center">
            <i className={`fas ${icon} text-2xl`}></i>
        </div>
        <div className="ml-4">
            <h3 className="text-lg font-bold text-expert-gray">{title}</h3>
            <p className="text-3xl font-heading font-bold text-expert-blue">{value}</p>
        </div>
    </div>
);

const initialNewProductState: Omit<Product, 'id'> = {
  name: '', oemRef: '', brand: '', model: '', year: new Date().getFullYear(), category: PartCategory.MECANIQUE, price: 0, condition: 'Occasion', warranty: '3 mois', compatibility: '', images: [], description: ''
};

const initialNewAuctionState: Omit<Auction, 'id' | 'currentBid' | 'bidCount' | 'bids'> = {
    vehicle: { name: '', brand: '', model: '', year: new Date().getFullYear(), mileage: 0, description: '', images: [], videos: []},
    startingPrice: 1000,
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
};

const initialNewUserState: Omit<User, 'id' | 'status'> & { password?: string } = {
  name: '',
  email: '',
  password: '',
  role: 'Staff'
};

const initialComposeState = { to: '', subject: '', content: '' };
const initialNewContactState = { name: '', email: '', source: 'Manuel' };


export default function AdminPage(): React.ReactNode {
  const { user, logout } = useAuth();
  const { settings: initialSettings, updateSettings, isLoading: isLoadingSettings } = useSettings();
  const { showToast } = useToast();

  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const [products, setProducts] = useState<Product[]>([]);
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [messages, setMessages] = useState<AdminMessage[]>([]);
  const [liftBookings, setLiftBookings] = useState<LiftRentalBooking[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<AdminMessage | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Settings form state
  const [settingsFormData, setSettingsFormData] = useState<SiteSettings | null>(null);
  const [newFooterServiceLink, setNewFooterServiceLink] = useState({ text: '', url: '' });
  const [newFooterInfoLink, setNewFooterInfoLink] = useState({ text: '', url: '' });
  const [newTestimonial, setNewTestimonial] = useState({ text: '', author: '' });
  const [newService, setNewService] = useState({ icon: '', title: '', description: '', link: '' });
  const [isAdvancedSettingsOpen, setIsAdvancedSettingsOpen] = useState(false);
  const [activeServicePageTab, setActiveServicePageTab] = useState<ServicePageTab>('repairs');
  const [newFeatureText, setNewFeatureText] = useState({ repairs: '', maintenance: '', tires: '', vhu: '' });
  const [newFaqItem, setNewFaqItem] = useState({ question: '', answer: '' });
  
  // Messaging state
  const [messageViewFilter, setMessageViewFilter] = useState<'inbox' | 'archived'>('inbox');
  const [replyContent, setReplyContent] = useState('');
  const [replyAttachment, setReplyAttachment] = useState<File | null>(null);
  const [isReplying, setIsReplying] = useState(false);
  
  // Modals state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productFormData, setProductFormData] = useState<Omit<Product, 'id'>>(initialNewProductState);
  const [productImageInput, setProductImageInput] = useState('');
  
  const [isAuctionModalOpen, setIsAuctionModalOpen] = useState(false);
  const [editingAuction, setEditingAuction] = useState<Auction | null>(null);
  const [auctionFormData, setAuctionFormData] = useState(initialNewAuctionState);
  const [auctionImageInput, setAuctionImageInput] = useState('');
  const [auctionVideoInput, setAuctionVideoInput] = useState('');

  // User management state
  const [isUserEditModalOpen, setIsUserEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userEditFormData, setUserEditFormData] = useState<Partial<User>>({});
  const [newUserFormData, setNewUserFormData] = useState(initialNewUserState);
  const [userStatusFilter, setUserStatusFilter] = useState('all');
  
  // Compose modal state
  const [isComposeModalOpen, setIsComposeModalOpen] = useState(false);
  const [composeFormData, setComposeFormData] = useState(initialComposeState);
  const [composeAttachment, setComposeAttachment] = useState<File | null>(null);
  const [isSending, setIsSending] = useState(false);

  // Address book state
  const [newContactFormData, setNewContactFormData] = useState(initialNewContactState);
  
  // Lift management state
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [newPricingTier, setNewPricingTier] = useState({ duration: '', price: '' });

  useEffect(() => {
    if (initialSettings) {
        setSettingsFormData(JSON.parse(JSON.stringify(initialSettings))); // Deep copy
    }
  }, [initialSettings]);

  useEffect(() => {
    const loadData = async () => {
      setIsLoadingData(true);
      setError(null);
      try {
        const [productsData, auctionsData, usersData, messagesData, bookingsData, logsData, contactsData] = await Promise.all([
          api.getProducts({}),
          api.getAuctions(),
          api.getAdminUsers(),
          api.getAdminMessages(),
          api.getLiftRentalBookings(),
          api.getAuditLogs(),
          api.getContacts()
        ]);
        setProducts(productsData);
        setAuctions(auctionsData);
        setUsers(usersData);
        setAuditLogs(logsData);
        setContacts(contactsData);
        setLiftBookings(bookingsData.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        const sortedMessages = messagesData.sort((a, b) => new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime());
        setMessages(sortedMessages);
        
        const firstInboxMessage = sortedMessages.find(m => !m.isArchived);
        if (firstInboxMessage) {
            handleSelectMessage(firstInboxMessage, sortedMessages);
        }
      } catch (err) {
        console.error("Failed to load admin data", err);
        setError("Erreur lors du chargement des données de l'administration.");
      } finally {
        setIsLoadingData(false);
      }
    };
    loadData();
  }, []);

  const handleSelectTab = (tab: AdminTab) => {
    setActiveTab(tab);
    setIsSidebarOpen(false);
  }

  const handleLogout = () => {
    logout();
    navigate('/connexion');
  };

  // --- Product CRUD ---
  const handleOpenProductModal = (product: Product | null) => {
      setEditingProduct(product);
      setProductFormData(product ? { ...product } : initialNewProductState);
      setIsProductModalOpen(true);
  };
  const handleCloseProductModal = () => {
      setIsProductModalOpen(false);
      setEditingProduct(null);
      setProductFormData(initialNewProductState);
      setProductImageInput('');
  };
  const handleProductFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      const parsedValue = (e.target.type === 'number') ? parseFloat(value) || 0 : value;
      setProductFormData(prev => ({ ...prev, [name]: parsedValue }));
  };
  const handleAddProductImage = () => {
      if (productImageInput && !productFormData.images.includes(productImageInput)) {
          setProductFormData(prev => ({ ...prev, images: [...prev.images, productImageInput] }));
          setProductImageInput('');
      }
  };
   const handleLocalImageUpload = (e: React.ChangeEvent<HTMLInputElement>, formSetter: any) => {
    if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = reader.result as string;
            formSetter((prev: any) => ({ ...prev, images: [...prev.images, base64String] }));
        };
        reader.readAsDataURL(file);
        e.target.value = '';
    }
  };
  const handleRemoveProductImage = (imgUrl: string) => {
      setProductFormData(prev => ({ ...prev, images: prev.images.filter(img => img !== imgUrl) }));
  };
  const handleProductSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
          if (editingProduct) {
              const updated = await api.updateProduct(editingProduct.id, productFormData);
              setProducts(prev => prev.map(p => p.id === updated.id ? updated : p));
              showToast('Pièce mise à jour avec succès !', 'success');
          } else {
              const added = await api.addProduct(productFormData);
              setProducts(prev => [added, ...prev]);
              showToast('Pièce ajoutée avec succès !', 'success');
          }
          handleCloseProductModal();
      } catch (err) {
          showToast('Erreur lors de la sauvegarde de la pièce.', 'error');
      }
  };
  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette pièce ?')) return;
    try {
      await api.deleteProduct(id);
      setProducts(prev => prev.filter(p => p.id !== id));
      showToast('Pièce supprimée.', 'success');
    } catch (err) {
        showToast('Erreur lors de la suppression de la pièce.', 'error');
    }
  };

  // --- Auction CRUD ---
  const handleOpenAuctionModal = (auction: Auction | null) => {
      setEditingAuction(auction);
      const fallbackVehicle = { name: '', brand: '', model: '', year: new Date().getFullYear(), mileage: 0, description: '', images: [], videos: [] } as any;
      const withDefaults = auction ? {
        ...auction,
        vehicle: { ...(auction as any).vehicle ?? fallbackVehicle, images: Array.isArray((auction as any).vehicle?.images) ? (auction as any).vehicle.images : [] },
        endDate: new Date(auction.endDate)
      } : initialNewAuctionState;
      setAuctionFormData(withDefaults);
      setIsAuctionModalOpen(true);
  };
  const handleCloseAuctionModal = () => setIsAuctionModalOpen(false);

  const handleAuctionFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const [field, subfield] = name.split('.');

    setAuctionFormData(prev => {
        let newState = { ...prev };
        if (field === 'vehicle' && subfield) {
            newState.vehicle = { ...newState.vehicle, [subfield]: e.target.type === 'number' ? parseInt(value) || 0 : value };
        } else if (name === 'endDate') {
            newState.endDate = new Date(value);
        } else {
            (newState as any)[name] = e.target.type === 'number' ? parseFloat(value) || 0 : value;
        }
        return newState;
    });
  };
  const handleAddAuctionImage = () => {
      if (auctionImageInput && !auctionFormData.vehicle?.images?.includes(auctionImageInput)) {
          setAuctionFormData(prev => ({ ...prev, vehicle: {...prev.vehicle, images: [...(prev.vehicle?.images || []), auctionImageInput]}}));
          setAuctionImageInput('');
      }
  };
  const handleLocalAuctionImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = reader.result as string;
            setAuctionFormData(prev => ({ ...prev, vehicle: { ...prev.vehicle, images: [...(prev.vehicle?.images || []), base64String] } }));
        };
        reader.readAsDataURL(file);
        e.target.value = '';
    }
  };
  const handleRemoveAuctionImage = (imgUrl: string) => {
      setAuctionFormData(prev => ({ ...prev, vehicle: {...prev.vehicle, images: (prev.vehicle?.images || []).filter(img => img !== imgUrl)}}));
  };
  const handleAddAuctionVideo = () => {
      if (auctionVideoInput && !auctionFormData.vehicle?.videos?.includes(auctionVideoInput)) {
          setAuctionFormData(prev => ({ ...prev, vehicle: {...prev.vehicle, videos: [...(prev.vehicle?.videos || []), auctionVideoInput]}}));
          setAuctionVideoInput('');
      }
  };
  const handleRemoveAuctionVideo = (videoUrl: string) => {
      setAuctionFormData(prev => ({ ...prev, vehicle: {...prev.vehicle, videos: (prev.vehicle?.videos || []).filter(v => v !== videoUrl)}}));
  };

  const handleAuctionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingAuction) {
          const updated = await api.updateAuction(editingAuction.id, auctionFormData);
          setAuctions(prev => prev.map(a => a.id === updated.id ? updated : a));
          showToast('Offre mise à jour !', 'success');
      } else {
          const added = await api.addAuction(auctionFormData);
          setAuctions(prev => [added, ...prev]);
          showToast('Offre ajoutée !', 'success');
      }
      handleCloseAuctionModal();
    } catch (err) {
        showToast("Erreur lors de l'enregistrement de l'offre.", 'error');
    }
  };

  const handleDeleteAuction = async (id: string) => {
     if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette offre ?')) return;
    try {
      await api.deleteAuction(id);
      setAuctions(prev => prev.filter(a => a.id !== id));
      showToast('Offre supprimée.', 'success');
    } catch (err) {
        showToast("Erreur lors de la suppression de l'offre.", 'error');
    }
  };

  // --- User CRUD ---
  const pendingUsers = useMemo(() => users.filter(u => u.status === 'pending'), [users]);
  const filteredUsers = useMemo(() => {
    if (userStatusFilter === 'all') return users;
    return users.filter(u => u.status === userStatusFilter);
  }, [users, userStatusFilter]);

  const handleNewUserFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setNewUserFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAddUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserFormData.name || !newUserFormData.email || !newUserFormData.password) {
      showToast("Veuillez remplir tous les champs obligatoires.", 'error');
      return;
    }
    try {
      const addedUser = await api.addUser(newUserFormData);
      setUsers(prev => [addedUser, ...prev].sort((a, b) => a.name.localeCompare(b.name)));
      setNewUserFormData(initialNewUserState); // Reset form
      showToast('Utilisateur ajouté avec succès !', 'success');
    } catch (error) {
      showToast(`Erreur lors de l'ajout de l'utilisateur.`, 'error');
    }
  };

  const handleOpenUserEditModal = (user: User) => {
    setEditingUser(user);
    setUserEditFormData({ name: user.name, email: user.email, role: user.role });
    setIsUserEditModalOpen(true);
  };
  
  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      const updatedUser = await api.updateUser(editingUser.id, userEditFormData);
      setUsers(prev => prev.map(u => (u.id === editingUser.id ? updatedUser : u)));
      setIsUserEditModalOpen(false);
      showToast("Utilisateur mis à jour.", 'success');
    } catch (error) {
        showToast("Erreur lors de la mise à jour.", 'error');
    }
  };

  const handleApproveUser = async (userId: string) => {
    try {
      const updatedUser = await api.approveUser(userId);
      setUsers(users.map(u => u.id === userId ? updatedUser : u));
      showToast("Utilisateur approuvé.", 'success');
    } catch (error) {
       showToast("Erreur lors de l'approbation.", 'error');
    }
  };
  
  const handleDeleteUser = async (id: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) return;
    try {
      await api.deleteUser(id);
      setUsers(prev => prev.filter(u => u.id !== id));
      showToast("Utilisateur supprimé.", 'success');
    } catch(error) {
        showToast("Erreur lors de la suppression.", 'error');
    }
  };
  
  // --- Messaging ---
  const unreadMessagesCount = useMemo(() => messages.filter(m => !m.isRead && !m.isArchived).length, [messages]);
  const inboxMessages = useMemo(() => messages.filter(m => !m.isArchived), [messages]);
  const archivedMessages = useMemo(() => messages.filter(m => m.isArchived), [messages]);
  const messagesToList = messageViewFilter === 'inbox' ? inboxMessages : archivedMessages;

  const handleSelectMessage = (message: AdminMessage, currentMessages = messages) => {
    setSelectedMessage(message);
    setReplyContent('');
    setReplyAttachment(null);
    if (!message.isRead) {
        setMessages(currentMessages.map(m => m.id === message.id ? { ...m, isRead: true } : m));
    }
  };
  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMessage || !replyContent.trim()) return;
    setIsReplying(true);
    try {
      await api.sendAdminReply({
        to: selectedMessage.senderEmail,
        subject: `Re: ${selectedMessage.subject}`,
        content: replyContent,
        attachment: replyAttachment,
        messageId: selectedMessage.id
      });
      showToast('Réponse envoyée avec succès !', 'success');
      setReplyContent('');
      setReplyAttachment(null);
    } catch (error) {
      showToast("Erreur lors de l'envoi de la réponse.", 'error');
    } finally {
      setIsReplying(false);
    }
  };

  const handleArchiveMessage = async (messageId: string, archive: boolean) => {
    if (!selectedMessage) return;
    try {
        const updatedMessage = await api.archiveMessage(messageId, archive);
        const newMessages = messages.map(m => m.id === messageId ? updatedMessage : m);
        setMessages(newMessages);
        showToast(archive ? 'Message archivé.' : 'Message désarchivé.', 'success');

        const currentList = archive ? newMessages.filter(m => !m.isArchived) : newMessages.filter(m => m.isArchived);
        const currentIndex = (archive ? inboxMessages : archivedMessages).findIndex(m => m.id === messageId);
        
        let nextMessage = null;
        if (currentList.length > 0) {
            nextMessage = currentList[currentIndex] || currentList[currentList.length - 1];
        }
        setSelectedMessage(nextMessage);
    } catch (error) {
        showToast("Erreur lors de l'archivage.", 'error');
    }
  };

  const handleToggleReadStatus = (messageId: string) => {
    setMessages(prevMessages => {
        return prevMessages.map(m => {
            if (m.id === messageId) {
                const updatedMessage = { ...m, isRead: !m.isRead };
                if (selectedMessage && selectedMessage.id === messageId) setSelectedMessage(updatedMessage);
                return updatedMessage;
            }
            return m;
        });
    });
  };

  // --- Compose Modal ---
  const handleOpenComposeModal = (toEmail: string = '') => {
      setComposeFormData({ ...initialComposeState, to: toEmail });
      setComposeAttachment(null);
      setIsComposeModalOpen(true);
  };
  const handleComposeFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setComposeFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };
  const handleComposeSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSending(true);
      try {
          await api.sendNewMessage({ ...composeFormData, attachment: composeAttachment });
          showToast('Message envoyé !', 'success');
          setIsComposeModalOpen(false);
      } catch (error) {
          showToast("Erreur lors de l'envoi du message.", 'error');
      } finally {
          setIsSending(false);
      }
  };

  // --- Address Book ---
  const handleAddContactSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
          const newContact = await api.addContact(newContactFormData);
          setContacts(prev => [newContact, ...prev].sort((a,b) => a.name.localeCompare(b.name)));
          setNewContactFormData(initialNewContactState);
          showToast('Contact ajouté.', 'success');
      } catch (error: any) {
          showToast(`Erreur: ${error.message}`, 'error');
      }
  };

  // --- Lift Rental Management ---
   const handleBookingStatusChange = async (bookingId: string, status: LiftRentalBooking['status']) => {
        try {
            const updatedBooking = await api.updateLiftRentalBookingStatus(bookingId, status);
            setLiftBookings(prev => prev.map(b => b.id === bookingId ? updatedBooking : b));
            showToast('Statut de la réservation mis à jour.', 'success');
        } catch (error) {
            showToast("Erreur lors de la mise à jour.", 'error');
        }
    };
    
    // Calendar helpers
    const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

    const calendarGrid = useMemo(() => {
        const year = calendarDate.getFullYear();
        const month = calendarDate.getMonth();
        const daysInMonth = getDaysInMonth(year, month);
        let firstDay = getFirstDayOfMonth(year, month);
        firstDay = firstDay === 0 ? 6 : firstDay - 1; // Monday is 0

        const grid: (Date | null)[] = [];
        for (let i = 0; i < firstDay; i++) grid.push(null);
        for (let i = 1; i <= daysInMonth; i++) grid.push(new Date(year, month, i));
        return grid;
    }, [calendarDate]);

    const handleDateToggle = (date: Date) => {
        if (!settingsFormData) return;
        const dateString = date.toISOString().split('T')[0]; // YYYY-MM-DD
        const currentDates = settingsFormData.liftRental.unavailableDates;
        const newDates = currentDates.includes(dateString)
            ? currentDates.filter(d => d !== dateString)
            : [...currentDates, dateString];
        handleSettingsChange('liftRental.unavailableDates', newDates);
    };
    
    // Pricing Tiers CRUD
    const handleAddPricingTier = (e: React.FormEvent) => {
        e.preventDefault();
        if (!settingsFormData || !newPricingTier.duration || !newPricingTier.price) return;
        const newTier = { duration: parseInt(newPricingTier.duration), price: parseInt(newPricingTier.price) };
        if (isNaN(newTier.duration) || isNaN(newTier.price) || newTier.duration <= 0) return;
        if (settingsFormData.liftRental.pricingTiers.some(t => t.duration === newTier.duration)) {
            showToast("Un palier avec cette durée existe déjà.", 'error');
            return;
        }
        const newTiers = [...settingsFormData.liftRental.pricingTiers, newTier].sort((a, b) => a.duration - b.duration);
        handleSettingsChange('liftRental.pricingTiers', newTiers);
        setNewPricingTier({ duration: '', price: '' });
    };

    const handleDeletePricingTier = (duration: number) => {
        if (!settingsFormData) return;
        const newTiers = settingsFormData.liftRental.pricingTiers.filter(t => t.duration !== duration);
        handleSettingsChange('liftRental.pricingTiers', newTiers);
    };


  // --- Settings ---
    const handleSettingsChange = (path: string, value: any) => {
        if (!settingsFormData) return;
        setSettingsFormData(prev => {
            const newSettings = JSON.parse(JSON.stringify(prev)); // Deep copy
            let current: any = newSettings;
            const keys = path.split('.');
            for (let i = 0; i < keys.length - 1; i++) {
                current = current[keys[i]];
            }
            current[keys[keys.length - 1]] = value;
            return newSettings;
        });
    };
    
    const handleSettingsFileUpload = (e: React.ChangeEvent<HTMLInputElement>, path: string) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                handleSettingsChange(path, base64String);
            };
            reader.readAsDataURL(file);
        }
    };
    
    // --- Homepage Services Management ---
    const handleServiceChange = (index: number, field: keyof Omit<ServiceInfo, 'id'>, value: string) => {
        if (!settingsFormData) return;
        const updatedServices = [...settingsFormData.services];
        updatedServices[index] = { ...updatedServices[index], [field]: value };
        handleSettingsChange('services', updatedServices);
    };

    const handleDeleteService = (id: string) => {
        if (!settingsFormData) return;
        if (window.confirm('Êtes-vous sûr de vouloir supprimer ce service ?')) {
            const updatedServices = settingsFormData.services.filter(service => service.id !== id);
            handleSettingsChange('services', updatedServices);
        }
    };

    const handleAddService = () => {
        if (!settingsFormData || !newService.title || !newService.link) {
            showToast('Veuillez remplir au moins le titre et le lien.', 'error');
            return;
        }
        const newServiceEntry: ServiceInfo = { id: `serv-${Date.now()}`, ...newService };
        const updatedServices = [...settingsFormData.services, newServiceEntry];
        handleSettingsChange('services', updatedServices);
        setNewService({ icon: '', title: '', description: '', link: '' }); // Reset form
    };

    // --- Footer Links Management ---
    const handleFooterLinkChange = (listName: 'servicesLinks' | 'infoLinks', id: string, field: 'text' | 'url', value: string) => {
        if (!settingsFormData) return;
        const updatedLinks = settingsFormData.footer[listName].map(link =>
            link.id === id ? { ...link, [field]: value } : link
        );
        handleSettingsChange(`footer.${listName}`, updatedLinks);
    };

    const handleDeleteFooterLink = (listName: 'servicesLinks' | 'infoLinks', id: string) => {
        if (!settingsFormData || !window.confirm('Supprimer ce lien ?')) return;
        const updatedLinks = settingsFormData.footer[listName].filter((link: FooterLink) => link.id !== id);
        handleSettingsChange(`footer.${listName}`, updatedLinks);
    };
    
    const handleAddFooterLink = (listName: 'servicesLinks' | 'infoLinks') => {
        if (!settingsFormData) return;
        const linkData = listName === 'servicesLinks' ? newFooterServiceLink : newFooterInfoLink;
        if (!linkData.text || !linkData.url) {
            showToast('Veuillez remplir le texte et l\'URL.', 'error');
            return;
        }
        const newLink: FooterLink = { id: `fl-${Date.now()}`, ...linkData };
        handleSettingsChange(`footer.${listName}`, [...settingsFormData.footer[listName], newLink]);
        if (listName === 'servicesLinks') setNewFooterServiceLink({ text: '', url: '' });
        else setNewFooterInfoLink({ text: '', url: '' });
    };
    
     // --- Testimonials Management ---
    const handleTestimonialChange = (id: string, field: 'text' | 'author', value: string) => {
        if (!settingsFormData) return;
        const updatedTestimonials = settingsFormData.testimonials.map(t =>
            t.id === id ? { ...t, [field]: value } : t
        );
        handleSettingsChange('testimonials', updatedTestimonials);
    };

    const handleDeleteTestimonial = (id: string) => {
        if (!settingsFormData || !window.confirm('Supprimer ce témoignage ?')) return;
        const updatedTestimonials = settingsFormData.testimonials.filter((t: Testimonial) => t.id !== id);
        handleSettingsChange('testimonials', updatedTestimonials);
    };
    
    const handleAddTestimonial = () => {
        if (!settingsFormData || !newTestimonial.text || !newTestimonial.author) {
            showToast('Veuillez remplir le texte et l\'auteur.', 'error');
            return;
        }
        const newEntry: Testimonial = { id: `test-${Date.now()}`, ...newTestimonial };
        handleSettingsChange('testimonials', [...settingsFormData.testimonials, newEntry]);
        setNewTestimonial({ text: '', author: '' }); // Reset form
    };
    
    // --- Service Page Content ---
    const handleAddFeature = (pageKey: ServicePageTab) => {
        if (!settingsFormData || !newFeatureText[pageKey].trim()) return;
        const updatedFeatures = [...settingsFormData.pageContent[pageKey].features, newFeatureText[pageKey]];
        handleSettingsChange(`pageContent.${pageKey}.features`, updatedFeatures);
        setNewFeatureText(prev => ({ ...prev, [pageKey]: '' }));
    };

    const handleDeleteFeature = (pageKey: ServicePageTab, index: number) => {
        if (!settingsFormData) return;
        const updatedFeatures = settingsFormData.pageContent[pageKey].features.filter((_, i) => i !== index);
        handleSettingsChange(`pageContent.${pageKey}.features`, updatedFeatures);
    };

    // --- FAQ Management ---
    const handleFaqChange = (id: string, field: 'question' | 'answer', value: string) => {
        if (!settingsFormData) return;
        const updated = (settingsFormData.faq || []).map(item =>
            item.id === id ? { ...item, [field]: value } : item
        );
        handleSettingsChange('faq', updated);
    };

    const handleDeleteFaqItem = (id: string) => {
        if (!settingsFormData || !window.confirm('Supprimer cette question ?')) return;
        const updated = (settingsFormData.faq || []).filter(item => item.id !== id);
        handleSettingsChange('faq', updated);
    };

    const handleAddFaqItem = () => {
        if (!settingsFormData || !newFaqItem.question || !newFaqItem.answer) return;
        const newItem = { id: `faq-${Date.now()}`, ...newFaqItem };
        const updated = [...(settingsFormData.faq || []), newItem];
        handleSettingsChange('faq', updated);
        setNewFaqItem({ question: '', answer: '' });
    };

    const handleSettingsSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!settingsFormData) return;
        try {
            await updateSettings(settingsFormData);
            showToast('Paramètres enregistrés avec succès !', 'success');
        } catch(error) {
            showToast("Erreur lors de l'enregistrement.", 'error');
        }
    }

    const handleSaveSettings = async () => {
        if (!settingsFormData) return;
        try {
            await updateSettings(settingsFormData);
            showToast('Paramètres de location sauvegardés avec succès !', 'success');
        } catch(error) {
            showToast("Erreur lors de la sauvegarde.", 'error');
        }
    }
  
  const navItems = [
    { id: 'dashboard', icon: 'fa-tachometer-alt', text: 'Tableau de bord' },
    { id: 'products', icon: 'fa-cogs', text: 'Gestion des Pièces' },
    { id: 'auctions', icon: 'fa-tags', text: 'Gestion des Offres' },
    { id: 'users', icon: 'fa-users-cog', text: 'Gestion des utilisateurs' },
    { id: 'liftManagement', icon: 'fa-tools', text: 'Gestion des Ponts' },
    { id: 'messaging', icon: 'fa-envelope', text: 'Messagerie' },
    { id: 'addressBook', icon: 'fa-address-book', text: "Carnet d'adresses" },
    { id: 'settings', icon: 'fa-wrench', text: 'Paramétrages' },
    { id: 'audit', icon: 'fa-shield-halved', text: "Journal d'Audit" },
  ];

  const SidebarContent = () => (
     <div className="flex flex-col h-full">
        <div className="p-4 border-b border-white/20 flex justify-between items-center">
            <Link to="/" className="flex items-center space-x-2">
                 <span className="self-center text-xl font-heading font-semibold whitespace-nowrap text-white">
                    <i className="fas fa-car-burst mr-2"></i>Démolition Expert
                </span>
            </Link>
             <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-white text-2xl">
                <i className="fas fa-times"></i>
            </button>
        </div>
        <nav className="flex-1 px-2 py-4 space-y-2">
            {navItems.map(item => (
                <a 
                    key={item.id} 
                    href="#"
                    onClick={(e) => { e.preventDefault(); handleSelectTab(item.id as AdminTab); }}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors duration-200 text-lg ${
                        activeTab === item.id ? 'bg-expert-green text-white font-bold' : 'text-gray-300 hover:bg-white/10 hover:text-white'
                    }`}
                >
                    <div className="flex items-center">
                      <i className={`fas ${item.icon} mr-3 w-6 text-center`}></i>
                      <span>{item.text}</span>
                    </div>
                    {item.id === 'messaging' && unreadMessagesCount > 0 && (
                      <span className="bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
                        {unreadMessagesCount}
                      </span>
                    )}
                     {item.id === 'users' && pendingUsers.length > 0 && (
                      <span className="bg-yellow-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
                        {pendingUsers.length}
                      </span>
                    )}
                </a>
            ))}
        </nav>
        <div className="p-4 border-t border-white/20">
            <p className="text-sm">Connecté : <span className="font-bold">{user?.name}</span></p>
            <button onClick={handleLogout} className="w-full text-left mt-4 px-4 py-2 rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500 hover:text-white transition-colors">
                <i className="fas fa-sign-out-alt mr-2"></i>Déconnexion
            </button>
        </div>
     </div>
  );
  
  const renderServicePageEditor = (pageKey: ServicePageTab, pageData: ServicePageSettings) => (
    <div className="space-y-6">
        <div>
            <h4 className="font-semibold text-lg mb-2 text-expert-blue">Section Héro</h4>
            <div className="space-y-2">
                 <input value={pageData.heroTitle} onChange={e => handleSettingsChange(`pageContent.${pageKey}.heroTitle`, e.target.value)} className="w-full p-2 border rounded" placeholder="Titre principal"/>
                 <input value={pageData.heroSubtitle} onChange={e => handleSettingsChange(`pageContent.${pageKey}.heroSubtitle`, e.target.value)} className="w-full p-2 border rounded" placeholder="Sous-titre"/>
                 <div>
                    <label className="block text-sm font-medium">Image de fond</label>
                    <input type="text" value={pageData.heroImage} onChange={e => handleSettingsChange(`pageContent.${pageKey}.heroImage`, e.target.value)} className="w-full p-2 border rounded mb-1" placeholder="URL de l'image"/>
                    <input type="file" accept="image/*" onChange={e => handleSettingsFileUpload(e, `pageContent.${pageKey}.heroImage`)} className="text-sm" />
                 </div>
            </div>
        </div>
        <div>
            <h4 className="font-semibold text-lg mb-2 text-expert-blue">Contenu Principal</h4>
             <div className="space-y-2">
                <input value={pageData.contentTitle} onChange={e => handleSettingsChange(`pageContent.${pageKey}.contentTitle`, e.target.value)} className="w-full p-2 border rounded" placeholder="Titre du contenu"/>
                <textarea value={pageData.contentDescription} onChange={e => handleSettingsChange(`pageContent.${pageKey}.contentDescription`, e.target.value)} className="w-full p-2 border rounded" rows={4} placeholder="Description"/>
                 <div>
                    <label className="block text-sm font-medium">Image du contenu</label>
                    <input type="text" value={pageData.contentImage} onChange={e => handleSettingsChange(`pageContent.${pageKey}.contentImage`, e.target.value)} className="w-full p-2 border rounded mb-1" placeholder="URL de l'image"/>
                    <input type="file" accept="image/*" onChange={e => handleSettingsFileUpload(e, `pageContent.${pageKey}.contentImage`)} className="text-sm" />
                 </div>
            </div>
        </div>
        <div>
            <h4 className="font-semibold text-lg mb-2 text-expert-blue">Liste des caractéristiques</h4>
            <div className="space-y-2">
                {pageData.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                        <input value={feature} onChange={e => {
                            const newFeatures = [...pageData.features];
                            newFeatures[index] = e.target.value;
                            handleSettingsChange(`pageContent.${pageKey}.features`, newFeatures);
                        }} className="w-full p-2 border rounded bg-gray-50"/>
                        <button type="button" onClick={() => handleDeleteFeature(pageKey, index)} className="text-red-500 hover:text-red-700 p-2"><i className="fas fa-trash"></i></button>
                    </div>
                ))}
            </div>
             <div className="flex items-center gap-2 mt-2">
                <input 
                    value={newFeatureText[pageKey]} 
                    onChange={e => setNewFeatureText(prev => ({...prev, [pageKey]: e.target.value}))} 
                    className="w-full p-2 border rounded" 
                    placeholder="Ajouter une nouvelle caractéristique (peut contenir du HTML simple comme <strong>)"
                />
                <button type="button" onClick={() => handleAddFeature(pageKey)} className="bg-expert-blue text-white font-bold p-2 rounded hover:bg-expert-blue/80 flex-shrink-0">Ajouter</button>
            </div>
        </div>
    </div>
  );

  const isLoading = isLoadingData || isLoadingSettings;

  return (
    <div className="flex h-screen bg-expert-light-gray text-expert-gray font-sans">
      <div className={`fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden ${isSidebarOpen ? 'block' : 'hidden'}`} onClick={() => setIsSidebarOpen(false)}></div>
      <aside className={`fixed inset-y-0 left-0 w-80 bg-expert-blue text-white flex flex-col transform md:relative md:translate-x-0 transition-transform duration-300 ease-in-out z-30 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <SidebarContent />
      </aside>

      <div className="flex-1 flex flex-col overflow-y-auto">
        <header className="bg-white shadow-sm p-4 flex items-center justify-between md:hidden sticky top-0 z-10">
          <button onClick={() => setIsSidebarOpen(true)} className="text-gray-500 focus:outline-none">
              <i className="fas fa-bars text-2xl"></i>
          </button>
          <h1 className="text-xl font-bold text-expert-blue">
            {navItems.find(i => i.id === activeTab)?.text}
          </h1>
          <div></div>
        </header>

        <main className="p-6 md:p-10">
          {isLoading ? <LoadingSpinner message="Chargement de l'administration..." /> : 
           error ? <ErrorMessage message={error} /> : (
            <>
            {activeTab === 'dashboard' && (
              <div id="dashboard-panel">
                  <h1 className="text-4xl font-bold font-heading text-expert-blue mb-8 animate-fade-in-down">Tableau de bord</h1>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                      <StatCard title="Pièces en Vente" value={products.length} icon="fa-cogs" />
                      <StatCard title="Offres Actives" value={auctions.length} icon="fa-tags" />
                      <StatCard title="Utilisateurs" value={users.length} icon="fa-users" />
                      <StatCard title="Inscriptions en attente" value={pendingUsers.length} icon="fa-user-clock" />
                  </div>
              </div>
            )}
            {activeTab === 'products' && (
              <div id="products-panel">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-3xl font-bold font-heading text-expert-blue">Gestion des pièces ({products.length})</h2>
                    <button onClick={() => handleOpenProductModal(null)} className="bg-expert-green text-white font-bold py-2 px-4 rounded-lg hover:bg-green-600 transition-colors">
                        <i className="fas fa-plus mr-2"></i> Ajouter une pièce
                    </button>
                </div>
                 <div className="bg-white rounded-lg shadow-md overflow-x-auto">
                    <table className="w-full min-w-[700px]">
                      <thead><tr className="border-b bg-gray-50"><th className="text-left p-3 font-bold">Nom</th><th className="text-left p-3 font-bold">Marque/Modèle</th><th className="text-left p-3 font-bold">Prix</th><th className="text-left p-3 font-bold">Actions</th></tr></thead>
                      <tbody>
                        {products.map(p => (
                          <tr key={p.id} className="border-b hover:bg-gray-50">
                            <td className="p-3">{p.name}</td>
                            <td className="p-3">{p.brand} {p.model}</td>
                            <td className="p-3">{p.price} €</td>
                            <td className="p-3 whitespace-nowrap">
                                <button onClick={() => handleOpenProductModal(p)} className="text-blue-500 hover:text-blue-700 p-2 rounded-md hover:bg-blue-100"><i className="fas fa-edit"></i> Modifier</button>
                                <button onClick={() => handleDeleteProduct(p.id)} className="text-red-500 hover:text-red-700 p-2 rounded-md hover:bg-red-100 ml-2"><i className="fas fa-trash"></i> Supprimer</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                 </div>
              </div>
            )}
            {activeTab === 'auctions' && (
              <div id="auctions-panel">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-3xl font-bold font-heading text-expert-blue">Gestion des offres ({auctions.length})</h2>
                    <button onClick={() => handleOpenAuctionModal(null)} className="bg-expert-green text-white font-bold py-2 px-4 rounded-lg hover:bg-green-600 transition-colors">
                        <i className="fas fa-plus mr-2"></i> Ajouter une offre
                    </button>
                </div>
                
                <div className="bg-white rounded-lg shadow-md overflow-x-auto">
                    <table className="w-full min-w-[700px]">
                      <thead><tr className="border-b bg-gray-50"><th className="text-left p-3 font-bold">Véhicule</th><th className="text-left p-3 font-bold">Offre Actuelle</th><th className="text-left p-3 font-bold">Fin le</th><th className="text-left p-3 font-bold">Actions</th></tr></thead>
                       <tbody>
                        {auctions.map(a => (
                          <tr key={a.id} className="border-b hover:bg-gray-50">
                            <td className="p-3">{a.vehicle?.name || 'N/A'}</td>
                            <td className="p-3">{a.currentBid || 0} €</td>
                            <td className="p-3">{new Date(a.endDate).toLocaleDateString('fr-FR')}</td>
                            <td className="p-3 whitespace-nowrap">
                               <button onClick={() => handleOpenAuctionModal(a)} className="text-blue-500 hover:text-blue-700 p-2 rounded-md hover:bg-blue-100"><i className="fas fa-edit"></i> Modifier</button>
                               <button onClick={() => handleDeleteAuction(a.id)} className="text-red-500 hover:text-red-700 p-2 rounded-md hover:bg-red-100 ml-2"><i className="fas fa-trash"></i> Supprimer</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                 </div>
              </div>
            )}
            {activeTab === 'users' && (
              <div id="users-panel">
                <h2 className="text-3xl font-bold font-heading text-expert-blue mb-8">Gestion des utilisateurs</h2>
                
                <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                  <h3 className="text-xl font-bold font-heading text-expert-blue mb-4">Ajouter un nouvel utilisateur</h3>
                  <form onSubmit={handleAddUserSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                      <div className="lg:col-span-2">
                          <label htmlFor="newUserName" className="block text-sm font-medium">Nom complet</label>
                          <input id="newUserName" name="name" type="text" value={newUserFormData.name} onChange={handleNewUserFormChange} className="mt-1 w-full p-2 border rounded" required />
                      </div>
                      <div>
                          <label htmlFor="newUserEmail" className="block text-sm font-medium">Email</label>
                          <input id="newUserEmail" name="email" type="email" value={newUserFormData.email} onChange={handleNewUserFormChange} className="mt-1 w-full p-2 border rounded" required />
                      </div>
                      <div>
                          <label htmlFor="newUserPassword" className="block text-sm font-medium">Mot de passe</label>
                          <input id="newUserPassword" name="password" type="password" value={newUserFormData.password || ''} onChange={handleNewUserFormChange} className="mt-1 w-full p-2 border rounded" required />
                      </div>
                      <div>
                          <label htmlFor="newUserRole" className="block text-sm font-medium">Rôle</label>
                          <select id="newUserRole" name="role" value={newUserFormData.role} onChange={handleNewUserFormChange} className="mt-1 w-full p-2 border rounded bg-white h-[42px]">
                              <option value="Staff">Staff</option>
                              <option value="Admin">Admin</option>
                          </select>
                      </div>
                      <button type="submit" className="bg-expert-green text-white font-bold py-2 px-4 rounded-lg hover:bg-green-600 transition-colors h-[42px]">
                          <i className="fas fa-plus mr-2"></i> Ajouter
                      </button>
                  </form>
                </div>
                
                <div className="bg-white rounded-lg shadow-md">
                    <div className="p-4 flex justify-between items-center border-b">
                         <h3 className="text-xl font-bold font-heading text-expert-blue">Liste des utilisateurs ({users.length})</h3>
                         <div>
                            <label htmlFor="userStatusFilter" className="mr-2 text-sm">Filtrer:</label>
                            <select id="userStatusFilter" value={userStatusFilter} onChange={(e) => setUserStatusFilter(e.target.value)} className="p-2 border rounded bg-white">
                                <option value="all">Tous</option>
                                <option value="approved">Approuvés</option>
                                <option value="pending">En attente</option>
                            </select>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[700px]">
                        <thead><tr className="border-b bg-gray-50"><th className="text-left p-3 font-bold">Nom</th><th className="text-left p-3 font-bold">Email</th><th className="text-left p-3 font-bold">Rôle</th><th className="text-left p-3 font-bold">Statut</th><th className="text-left p-3 font-bold">Actions</th></tr></thead>
                        <tbody>
                          {filteredUsers.map(u => (
                            <tr key={u.id} className="border-b hover:bg-gray-50">
                              <td className="p-3">{u.name}</td>
                              <td className="p-3">{u.email}</td>
                              <td className="p-3">{u.role}</td>
                              <td className="p-3">
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${u.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                    {u.status === 'approved' ? 'Approuvé' : 'En attente'}
                                </span>
                              </td>
                              <td className="p-3 space-x-2 whitespace-nowrap">
                                {u.status === 'pending' && (
                                    <button onClick={() => handleApproveUser(u.id)} className="text-green-600 hover:text-green-800 p-2 rounded-md hover:bg-green-100">
                                      <i className="fas fa-check mr-1"></i> Approuver
                                    </button>
                                )}
                                <button onClick={() => handleOpenUserEditModal(u)} disabled={u.id === user?.id && u.role === 'Admin'} className="text-blue-500 hover:text-blue-700 p-2 rounded-md hover:bg-blue-100 disabled:text-gray-400 disabled:hover:bg-transparent disabled:cursor-not-allowed">
                                    <i className="fas fa-edit mr-1"></i> Modifier
                                </button>
                                <button onClick={() => handleDeleteUser(u.id)} disabled={u.id === user?.id} className="text-red-500 hover:text-red-700 p-2 rounded-md hover:bg-red-100 disabled:text-gray-400 disabled:hover:bg-transparent disabled:cursor-not-allowed">
                                    <i className="fas fa-trash mr-1"></i> Supprimer
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                </div>
              </div>
            )}
             {activeTab === 'liftManagement' && settingsFormData && (
                <div id="lift-management-panel">
                    <h2 className="text-3xl font-bold font-heading text-expert-blue mb-8">Gestion des Ponts Élévateurs</h2>
                    
                    <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                        <h3 className="text-xl font-bold font-heading text-expert-blue mb-4">Paramètres de location</h3>
                         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Pricing Tiers Management */}
                            <div>
                                <h4 className="font-semibold text-lg mb-2">Grille Tarifaire</h4>
                                <div className="space-y-2 mb-4">
                                    {settingsFormData.liftRental.pricingTiers.map(tier => (
                                        <div key={tier.duration} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                                            <span>{tier.duration} heure(s) - <span className="font-bold">{tier.price} €</span></span>
                                            <button onClick={() => handleDeletePricingTier(tier.duration)} className="text-red-500 hover:text-red-700 text-sm"><i className="fas fa-trash"></i></button>
                                        </div>
                                    ))}
                                </div>
                                <form onSubmit={handleAddPricingTier} className="flex items-end gap-2 p-2 bg-gray-100 rounded">
                                    <input type="number" placeholder="Durée (h)" value={newPricingTier.duration} onChange={e => setNewPricingTier({...newPricingTier, duration: e.target.value})} className="w-full p-2 border rounded" />
                                    <input type="number" placeholder="Prix (€)" value={newPricingTier.price} onChange={e => setNewPricingTier({...newPricingTier, price: e.target.value})} className="w-full p-2 border rounded" />
                                    <button type="submit" className="bg-expert-blue text-white font-bold p-2 rounded hover:bg-expert-blue/80 transition-colors flex-shrink-0">Ajouter</button>
                                </form>
                            </div>
                            
                            {/* Calendar Management */}
                            <div>
                                <h4 className="font-semibold text-lg mb-2">Calendrier des disponibilités</h4>
                                <div className="bg-gray-50 p-4 rounded">
                                    <div className="flex justify-between items-center mb-2">
                                        <button onClick={() => setCalendarDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))} className="p-2">&lt;</button>
                                        <span className="font-bold">{calendarDate.toLocaleString('fr-FR', { month: 'long', year: 'numeric' })}</span>
                                        <button onClick={() => setCalendarDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))} className="p-2">&gt;</button>
                                    </div>
                                    <div className="grid grid-cols-7 gap-1 text-center text-sm">
                                        {['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di'].map(day => <div key={day} className="font-bold">{day}</div>)}
                                        {calendarGrid.map((date, i) => {
                                            const isUnavailable = date ? settingsFormData.liftRental.unavailableDates.includes(date.toISOString().split('T')[0]) : false;
                                            return (
                                                <div key={i}>
                                                    {date && (
                                                        <button 
                                                            onClick={() => handleDateToggle(date)}
                                                            className={`w-8 h-8 rounded-full transition-colors ${
                                                                isUnavailable ? 'bg-red-400 text-white' : 'hover:bg-expert-blue/20'
                                                            }`}
                                                        >
                                                            {date.getDate()}
                                                        </button>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                         </div>
                         
                         {/* Save Button */}
                         <div className="mt-6 flex justify-end">
                            <button 
                                onClick={handleSaveSettings}
                                className="bg-expert-green text-white font-bold px-6 py-3 rounded-lg hover:bg-expert-green/80 transition-colors flex items-center gap-2"
                            >
                                <i className="fas fa-save"></i>
                                Sauvegarder les paramètres
                            </button>
                         </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md mt-8">
                         <h3 className="text-xl font-bold font-heading text-expert-blue p-4 border-b">Réservations ({liftBookings.length})</h3>
                         <div className="overflow-x-auto">
                            <table className="w-full min-w-[700px]">
                                <thead><tr className="border-b bg-gray-50"><th className="text-left p-3 font-bold">Client</th><th className="text-left p-3 font-bold">Date & Heure</th><th className="text-left p-3 font-bold">Durée</th><th className="text-left p-3 font-bold">Statut</th><th className="text-left p-3 font-bold">Actions</th></tr></thead>
                                <tbody>
                                    {liftBookings.map(b => (
                                        <tr key={b.id} className="border-b hover:bg-gray-50">
                                            <td className="p-3">{b.userName}<br/><span className="text-sm text-gray-500">{b.userEmail}</span></td>
                                            <td className="p-3">{new Date(b.date).toLocaleDateString('fr-FR')} à {b.time}</td>
                                            <td className="p-3">{b.duration}h</td>
                                            <td className="p-3">
                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                                    b.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                                    b.status === 'cancelled' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                    {b.status === 'confirmed' ? 'Confirmée' : b.status === 'pending' ? 'En attente' : 'Annulée'}
                                                </span>
                                            </td>
                                            <td className="p-3 space-x-2 whitespace-nowrap">
                                                {b.status === 'pending' && <button onClick={() => handleBookingStatusChange(b.id, 'confirmed')} className="text-green-600 hover:text-green-800">Confirmer</button>}
                                                {b.status !== 'cancelled' && <button onClick={() => handleBookingStatusChange(b.id, 'cancelled')} className="text-red-500 hover:text-red-700">Annuler</button>}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                         </div>
                    </div>

                </div>
            )}
            {activeTab === 'messaging' && (
                <div id="messaging-panel">
                    <h2 className="text-3xl font-bold font-heading text-expert-blue mb-8">Messagerie</h2>
                    <div className="flex h-[calc(100vh-200px)] bg-white rounded-lg shadow-md overflow-hidden">
                        {/* Message List */}
                        <div className="w-1/3 border-r flex flex-col">
                            <div className="p-4 border-b flex justify-between items-center">
                                <div className="flex gap-2">
                                    <button onClick={() => setMessageViewFilter('inbox')} className={`px-3 py-1 text-sm rounded-full ${messageViewFilter === 'inbox' ? 'bg-expert-blue text-white' : 'bg-gray-200'}`}>Boîte de réception ({inboxMessages.length})</button>
                                    <button onClick={() => setMessageViewFilter('archived')} className={`px-3 py-1 text-sm rounded-full ${messageViewFilter === 'archived' ? 'bg-expert-blue text-white' : 'bg-gray-200'}`}>Archivés ({archivedMessages.length})</button>
                                </div>
                                 <button onClick={() => handleOpenComposeModal()} className="text-expert-blue hover:text-expert-green" title="Nouveau message">
                                    <i className="fas fa-edit text-xl"></i>
                                </button>
                            </div>
                            <div className="overflow-y-auto">
                                {messagesToList.map(m => (
                                    <div key={m.id} onClick={() => handleSelectMessage(m)} className={`p-4 border-b cursor-pointer ${selectedMessage?.id === m.id ? 'bg-expert-light-gray' : 'hover:bg-gray-50'}`}>
                                        <div className="flex justify-between items-start">
                                            <p className={`font-bold ${!m.isRead && 'text-expert-blue'}`}>{m.senderName}</p>
                                            <p className="text-xs text-gray-500">{new Date(m.receivedAt).toLocaleDateString('fr-FR')}</p>
                                        </div>
                                        <p className="text-sm truncate">{m.subject}</p>
                                        <p className="text-xs text-gray-600 truncate">{m.content}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Message View */}
                        <div className="w-2/3 flex flex-col">
                            {selectedMessage ? (
                                <>
                                <div className="p-4 border-b">
                                    <div className="flex justify-between items-center">
                                         <h3 className="text-xl font-bold font-heading">{selectedMessage.subject}</h3>
                                         <div className="flex items-center">
                                            <button 
                                                onClick={() => handleToggleReadStatus(selectedMessage.id)}
                                                className="text-gray-500 hover:text-expert-blue p-2"
                                                title={selectedMessage.isRead ? "Marquer comme non lu" : "Marquer comme lu"}
                                            >
                                                <i className={`fas ${selectedMessage.isRead ? 'fa-envelope' : 'fa-envelope-open'}`}></i>
                                            </button>
                                            {messageViewFilter === 'inbox' ? (
                                                <button onClick={() => handleArchiveMessage(selectedMessage.id, true)} className="text-gray-500 hover:text-expert-blue p-2" title="Archiver"><i className="fas fa-archive"></i></button>
                                            ) : (
                                                <button onClick={() => handleArchiveMessage(selectedMessage.id, false)} className="text-gray-500 hover:text-expert-blue p-2" title="Désarchiver"><i className="fas fa-inbox"></i></button>
                                            )}
                                         </div>
                                    </div>
                                    <p>De: <a href={`mailto:${selectedMessage.senderEmail}`} className="text-expert-blue hover:underline">{selectedMessage.senderName} &lt;{selectedMessage.senderEmail}&gt;</a></p>
                                    <p className="text-sm text-gray-500">Reçu le: {new Date(selectedMessage.receivedAt).toLocaleString('fr-FR')}</p>
                                </div>
                                <div className="p-4 overflow-y-auto flex-1 bg-gray-50 whitespace-pre-wrap">{selectedMessage.content}</div>
                                {selectedMessage.attachment && <div className="p-4 border-t"><i className="fas fa-paperclip mr-2"></i><a href={selectedMessage.attachment.url} className="text-expert-blue hover:underline">{selectedMessage.attachment.name}</a></div>}
                                
                                {messageViewFilter === 'inbox' && (
                                    <div className="p-4 border-t bg-white">
                                        <h4 className="font-bold mb-2">Répondre</h4>
                                        <form onSubmit={handleReplySubmit}>
                                            <textarea value={replyContent} onChange={e => setReplyContent(e.target.value)} rows={4} className="w-full p-2 border rounded" placeholder={`Répondre à ${selectedMessage.senderName}...`} required></textarea>
                                            <div className="flex justify-between items-center mt-2">
                                                <input type="file" onChange={e => setReplyAttachment(e.target.files ? e.target.files[0] : null)} className="text-sm" />
                                                <button type="submit" disabled={isReplying} className="bg-expert-green text-white font-bold py-2 px-4 rounded-lg hover:bg-green-600 transition-colors disabled:bg-gray-400">
                                                    {isReplying ? "Envoi..." : "Envoyer"}
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                )}
                                </>
                            ) : (
                                <div className="flex items-center justify-center h-full text-gray-500">Sélectionnez un message à lire</div>
                            )}
                        </div>
                    </div>
                </div>
            )}
             {activeTab === 'addressBook' && (
                <div id="address-book-panel">
                    <h2 className="text-3xl font-bold font-heading text-expert-blue mb-8">Carnet d'adresses</h2>
                     <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                        <h3 className="text-xl font-bold font-heading text-expert-blue mb-4">Ajouter un nouveau contact</h3>
                        <form onSubmit={handleAddContactSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                            <input name="name" placeholder="Nom complet" value={newContactFormData.name} onChange={e => setNewContactFormData({...newContactFormData, name: e.target.value})} className="p-2 border rounded" required />
                            <input name="email" type="email" placeholder="Email" value={newContactFormData.email} onChange={e => setNewContactFormData({...newContactFormData, email: e.target.value})} className="p-2 border rounded" required />
                            <input name="source" placeholder="Source" value={newContactFormData.source} onChange={e => setNewContactFormData({...newContactFormData, source: e.target.value})} className="p-2 border rounded" />
                            <button type="submit" className="bg-expert-green text-white font-bold py-2 px-4 rounded-lg hover:bg-green-600 transition-colors">
                                <i className="fas fa-plus mr-2"></i> Ajouter
                            </button>
                        </form>
                    </div>
                     <div className="bg-white rounded-lg shadow-md overflow-x-auto">
                        <table className="w-full min-w-[700px]">
                            <thead><tr className="border-b bg-gray-50"><th className="text-left p-3 font-bold">Nom</th><th className="text-left p-3 font-bold">Email</th><th className="text-left p-3 font-bold">Source</th><th className="text-left p-3 font-bold">Actions</th></tr></thead>
                            <tbody>
                                {contacts.map(c => (
                                    <tr key={c.id} className="border-b hover:bg-gray-50">
                                        <td className="p-3">{c.name}</td>
                                        <td className="p-3">{c.email}</td>
                                        <td className="p-3">{c.source}</td>
                                        <td className="p-3">
                                            <button onClick={() => handleOpenComposeModal(c.email)} className="text-expert-blue hover:text-expert-green"><i className="fas fa-paper-plane mr-2"></i>Écrire</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                     </div>
                </div>
            )}
            {activeTab === 'settings' && settingsFormData && (
              <div id="settings-panel">
                <h2 className="text-3xl font-bold font-heading text-expert-blue mb-8">Paramétrages du site</h2>
                <form onSubmit={handleSettingsSubmit} className="space-y-8">
                    {/* Business Info */}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-xl font-bold font-heading text-expert-blue mb-4 border-b pb-2">Informations de l'entreprise</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input value={settingsFormData.businessInfo.name} onChange={e => handleSettingsChange('businessInfo.name', e.target.value)} className="w-full p-2 border rounded" placeholder="Nom de l'entreprise"/>
                            <input value={settingsFormData.businessInfo.phone} onChange={e => handleSettingsChange('businessInfo.phone', e.target.value)} className="w-full p-2 border rounded" placeholder="Téléphone"/>
                            <input value={settingsFormData.businessInfo.email} onChange={e => handleSettingsChange('businessInfo.email', e.target.value)} className="w-full p-2 border rounded" placeholder="Email"/>
                            <input value={settingsFormData.businessInfo.address} onChange={e => handleSettingsChange('businessInfo.address', e.target.value)} className="w-full p-2 border rounded" placeholder="Adresse"/>
                            <input value={settingsFormData.businessInfo.openingHours} onChange={e => handleSettingsChange('businessInfo.openingHours', e.target.value)} className="w-full p-2 border rounded md:col-span-2" placeholder="Horaires d'ouverture"/>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium">Logo URL</label>
                                <input type="text" value={settingsFormData.businessInfo.logoUrl} onChange={e => handleSettingsChange('businessInfo.logoUrl', e.target.value)} className="w-full p-2 border rounded mb-1" placeholder="URL du logo"/>
                                <input type="file" accept="image/*" onChange={e => handleSettingsFileUpload(e, 'businessInfo.logoUrl')} className="text-sm" />
                            </div>
                        </div>
                    </div>
                    
                     {/* Page Content */}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-xl font-bold font-heading text-expert-blue mb-4 border-b pb-2">Aspect du site</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium">Couleur du Header</label>
                            <input type="color" value={settingsFormData.themeColors.headerBg} onChange={e => handleSettingsChange('themeColors.headerBg', e.target.value)} className="w-16 h-10 p-0 border rounded" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium">Couleur du Footer</label>
                            <input type="color" value={settingsFormData.themeColors.footerBg} onChange={e => handleSettingsChange('themeColors.footerBg', e.target.value)} className="w-16 h-10 p-0 border rounded" />
                          </div>
                        </div>
                        <div className="mt-6 space-y-2">
                          <h4 className="font-semibold text-lg text-expert-blue">Section Héro (Accueil)</h4>
                          <input value={settingsFormData.hero.title} onChange={e => handleSettingsChange('hero.title', e.target.value)} className="w-full p-2 border rounded" placeholder="Titre principal" />
                          <input value={settingsFormData.hero.subtitle} onChange={e => handleSettingsChange('hero.subtitle', e.target.value)} className="w-full p-2 border rounded" placeholder="Sous-titre" />
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <select value={settingsFormData.hero.background.type} onChange={e => handleSettingsChange('hero.background.type', e.target.value)} className="p-2 border rounded bg-white">
                              <option value="image">Image</option>
                              <option value="color">Couleur</option>
                            </select>
                            {settingsFormData.hero.background.type === 'image' ? (
                              <div className="md:col-span-2">
                                <input type="text" value={settingsFormData.hero.background.value} onChange={e => handleSettingsChange('hero.background.value', e.target.value)} className="w-full p-2 border rounded mb-1" placeholder="URL de l'image" />
                                <input type="file" accept="image/*" onChange={e => handleSettingsFileUpload(e, 'hero.background.value')} className="text-sm" />
                              </div>
                            ) : (
                              <div className="md:col-span-2">
                                <input type="color" value={settingsFormData.hero.background.value} onChange={e => handleSettingsChange('hero.background.value', e.target.value)} className="w-16 h-10 p-0 border rounded" />
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="mt-6">
                          <h4 className="font-semibold text-lg text-expert-blue mb-2">Réseaux sociaux</h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <input value={settingsFormData.socialLinks.facebook} onChange={e => handleSettingsChange('socialLinks.facebook', e.target.value)} className="w-full p-2 border rounded" placeholder="Lien Facebook" />
                            <input value={settingsFormData.socialLinks.twitter} onChange={e => handleSettingsChange('socialLinks.twitter', e.target.value)} className="w-full p-2 border rounded" placeholder="Lien X/Twitter" />
                            <input value={settingsFormData.socialLinks.linkedin} onChange={e => handleSettingsChange('socialLinks.linkedin', e.target.value)} className="w-full p-2 border rounded" placeholder="Lien LinkedIn" />
                          </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-xl font-bold font-heading text-expert-blue mb-4 border-b pb-2">Sections d'accueil</h3>
                        <div className="space-y-4">
                          {settingsFormData.services.map((s, index) => (
                            <div key={s.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-gray-50 p-3 rounded">
                              <input value={s.icon} onChange={e => handleServiceChange(index, 'icon', e.target.value)} className="p-2 border rounded" placeholder="Icône (fa cogs...)" />
                              <input value={s.title} onChange={e => handleServiceChange(index, 'title', e.target.value)} className="p-2 border rounded" placeholder="Titre" />
                              <input value={s.link} onChange={e => handleServiceChange(index, 'link', e.target.value)} className="p-2 border rounded" placeholder="Lien" />
                              <div className="flex items-center justify-between gap-2">
                                <input value={s.description} onChange={e => handleServiceChange(index, 'description', e.target.value)} className="p-2 border rounded w-full" placeholder="Description" />
                                <button type="button" onClick={() => handleDeleteService(s.id)} className="text-red-500"><i className="fas fa-trash"></i></button>
                              </div>
                            </div>
                          ))}
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-gray-100 p-3 rounded">
                            <input value={newService.icon} onChange={e => setNewService(prev => ({...prev, icon: e.target.value}))} className="p-2 border rounded" placeholder="Icône" />
                            <input value={newService.title} onChange={e => setNewService(prev => ({...prev, title: e.target.value}))} className="p-2 border rounded" placeholder="Titre" />
                            <input value={newService.link} onChange={e => setNewService(prev => ({...prev, link: e.target.value}))} className="p-2 border rounded" placeholder="Lien" />
                            <div className="flex items-center gap-2">
                              <input value={newService.description} onChange={e => setNewService(prev => ({...prev, description: e.target.value}))} className="p-2 border rounded w-full" placeholder="Description" />
                              <button type="button" onClick={handleAddService} className="bg-expert-blue text-white font-bold p-2 rounded">Ajouter</button>
                            </div>
                          </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-xl font-bold font-heading text-expert-blue mb-4 border-b pb-2">Bas de page</h3>
                        <textarea value={settingsFormData.footer.description} onChange={e => handleSettingsChange('footer.description', e.target.value)} className="w-full p-2 border rounded mb-4" rows={3} placeholder="Description du bas de page" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="font-semibold mb-2">Liens Services</h4>
                            <div className="space-y-2">
                              {settingsFormData.footer.servicesLinks.map(link => (
                                <div key={link.id} className="grid grid-cols-3 gap-2">
                                  <input value={link.text} onChange={e => handleFooterLinkChange('servicesLinks', link.id, 'text', e.target.value)} className="p-2 border rounded" placeholder="Texte" />
                                  <input value={link.url} onChange={e => handleFooterLinkChange('servicesLinks', link.id, 'url', e.target.value)} className="p-2 border rounded" placeholder="URL" />
                                  <button type="button" onClick={() => handleDeleteFooterLink('servicesLinks', link.id)} className="text-red-500"><i className="fas fa-trash"></i></button>
                                </div>
                              ))}
                              <div className="grid grid-cols-3 gap-2 bg-gray-100 p-2 rounded">
                                <input value={newFooterServiceLink.text} onChange={e => setNewFooterServiceLink(prev => ({...prev, text: e.target.value}))} className="p-2 border rounded" placeholder="Texte" />
                                <input value={newFooterServiceLink.url} onChange={e => setNewFooterServiceLink(prev => ({...prev, url: e.target.value}))} className="p-2 border rounded" placeholder="URL" />
                                <button type="button" onClick={() => handleAddFooterLink('servicesLinks')} className="bg-expert-blue text-white font-bold p-2 rounded">Ajouter</button>
                              </div>
                            </div>
                          </div>
                          <div>
                            <h4 className="font-semibold mb-2">Liens Informations</h4>
                            <div className="space-y-2">
                              {settingsFormData.footer.infoLinks.map(link => (
                                <div key={link.id} className="grid grid-cols-3 gap-2">
                                  <input value={link.text} onChange={e => handleFooterLinkChange('infoLinks', link.id, 'text', e.target.value)} className="p-2 border rounded" placeholder="Texte" />
                                  <input value={link.url} onChange={e => handleFooterLinkChange('infoLinks', link.id, 'url', e.target.value)} className="p-2 border rounded" placeholder="URL" />
                                  <button type="button" onClick={() => handleDeleteFooterLink('infoLinks', link.id)} className="text-red-500"><i className="fas fa-trash"></i></button>
                                </div>
                              ))}
                              <div className="grid grid-cols-3 gap-2 bg-gray-100 p-2 rounded">
                                <input value={newFooterInfoLink.text} onChange={e => setNewFooterInfoLink(prev => ({...prev, text: e.target.value}))} className="p-2 border rounded" placeholder="Texte" />
                                <input value={newFooterInfoLink.url} onChange={e => setNewFooterInfoLink(prev => ({...prev, url: e.target.value}))} className="p-2 border rounded" placeholder="URL" />
                                <button type="button" onClick={() => handleAddFooterLink('infoLinks')} className="bg-expert-blue text-white font-bold p-2 rounded">Ajouter</button>
                              </div>
                            </div>
                          </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-xl font-bold font-heading text-expert-blue mb-4 border-b pb-2">Témoignages</h3>
                        <div className="space-y-2">
                          {settingsFormData.testimonials.map(t => (
                            <div key={t.id} className="grid grid-cols-1 md:grid-cols-3 gap-2">
                              <textarea value={t.text} onChange={e => handleTestimonialChange(t.id, 'text', e.target.value)} className="p-2 border rounded md:col-span-2" rows={3} placeholder="Texte" />
                              <div className="flex items-center gap-2">
                                <input value={t.author} onChange={e => handleTestimonialChange(t.id, 'author', e.target.value)} className="p-2 border rounded w-full" placeholder="Auteur" />
                                <button type="button" onClick={() => handleDeleteTestimonial(t.id)} className="text-red-500"><i className="fas fa-trash"></i></button>
                              </div>
                            </div>
                          ))}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 bg-gray-100 p-3 rounded">
                            <textarea value={newTestimonial.text} onChange={e => setNewTestimonial(prev => ({...prev, text: e.target.value}))} className="p-2 border rounded md:col-span-2" rows={3} placeholder="Texte" />
                            <div className="flex items-center gap-2">
                              <input value={newTestimonial.author} onChange={e => setNewTestimonial(prev => ({...prev, author: e.target.value}))} className="p-2 border rounded w-full" placeholder="Auteur" />
                              <button type="button" onClick={handleAddTestimonial} className="bg-expert-blue text-white font-bold p-2 rounded">Ajouter</button>
                            </div>
                          </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-xl font-bold font-heading text-expert-blue mb-4 border-b pb-2">Contenu des Pages de Service</h3>
                        <div className="flex border-b mb-4">
                            {(['repairs', 'maintenance', 'tires'] as ServicePageTab[]).map(tab => (
                                <button
                                    key={tab}
                                    type="button"
                                    onClick={() => setActiveServicePageTab(tab)}
                                    className={`px-4 py-2 font-semibold ${activeServicePageTab === tab ? 'border-b-2 border-expert-blue text-expert-blue' : 'text-gray-500'}`}
                                >
                                    {tab === 'repairs' ? 'Réparation' : tab === 'maintenance' ? 'Entretien' : 'Pneus'}
                                </button>
                            ))}
                        </div>
                        {renderServicePageEditor(activeServicePageTab, settingsFormData.pageContent[activeServicePageTab])}
                    </div>

                    <button type="submit" className="bg-expert-green text-white font-bold py-3 px-6 rounded-lg hover:bg-green-600 transition-colors text-lg sticky bottom-6 shadow-lg">
                        <i className="fas fa-save mr-2"></i> Enregistrer tous les changements
                    </button>
                </form>
              </div>
            )}
             {activeTab === 'audit' && (
                <div id="audit-panel">
                     <h2 className="text-3xl font-bold font-heading text-expert-blue mb-8">Journal d'Audit</h2>
                     <div className="bg-white rounded-lg shadow-md overflow-x-auto">
                        <table className="w-full min-w-[700px]">
                             <thead><tr className="border-b bg-gray-50"><th className="text-left p-3 font-bold">Date</th><th className="text-left p-3 font-bold">Utilisateur</th><th className="text-left p-3 font-bold">Action</th><th className="text-left p-3 font-bold">Détails</th></tr></thead>
                             <tbody>
                                {auditLogs.map(log => (
                                    <tr key={log.id} className="border-b hover:bg-gray-50">
                                        <td className="p-3 text-sm text-gray-600 whitespace-nowrap">{new Date(log.timestamp).toLocaleString('fr-FR')}</td>
                                        <td className="p-3">{log.user}</td>
                                        <td className="p-3"><span className="font-mono text-xs bg-gray-200 px-2 py-1 rounded">{log.action}</span></td>
                                        <td className="p-3">{log.details}</td>
                                    </tr>
                                ))}
                             </tbody>
                        </table>
                     </div>
                </div>
            )}
            </>
          )}
        </main>
        
        {/* Modals */}
        <Modal isOpen={isProductModalOpen} onClose={handleCloseProductModal} title={editingProduct ? 'Modifier la pièce' : 'Ajouter une pièce'}>
             <form onSubmit={handleProductSubmit} className="space-y-4">
                <input name="name" placeholder="Nom de la pièce" value={productFormData.name} onChange={handleProductFormChange} className="w-full p-2 border rounded" required/>
                <div className="grid grid-cols-2 gap-4">
                    <input name="brand" placeholder="Marque" value={productFormData.brand} onChange={handleProductFormChange} className="p-2 border rounded"/>
                    <input name="model" placeholder="Modèle" value={productFormData.model} onChange={handleProductFormChange} className="p-2 border rounded"/>
                    <input name="year" type="number" placeholder="Année" value={productFormData.year} onChange={handleProductFormChange} className="p-2 border rounded"/>
                    <input name="price" type="number" placeholder="Prix" value={productFormData.price} onChange={handleProductFormChange} className="p-2 border rounded"/>
                </div>
                <input name="oemRef" placeholder="Référence OEM" value={productFormData.oemRef} onChange={handleProductFormChange} className="w-full p-2 border rounded"/>
                <select name="category" value={productFormData.category} onChange={handleProductFormChange} className="w-full p-2 border rounded bg-white">
                    {Object.values(PartCategory).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
                <select name="condition" value={productFormData.condition} onChange={handleProductFormChange} className="w-full p-2 border rounded bg-white">
                    <option value="Neuf">Neuf</option>
                    <option value="Bon état">Bon état</option>
                    <option value="Occasion">Occasion</option>
                </select>
                <input name="warranty" placeholder="Garantie" value={productFormData.warranty} onChange={handleProductFormChange} className="w-full p-2 border rounded"/>
                <textarea name="description" placeholder="Description" value={productFormData.description} onChange={handleProductFormChange} rows={3} className="w-full p-2 border rounded"/>
                <textarea name="compatibility" placeholder="Compatibilité" value={productFormData.compatibility} onChange={handleProductFormChange} rows={2} className="w-full p-2 border rounded"/>
                
                {/* Image Management */}
                <div>
                    <label className="block text-sm font-medium">Images (URLs)</label>
                    <div className="flex items-center gap-2">
                        <input type="text" value={productImageInput} onChange={(e) => setProductImageInput(e.target.value)} placeholder="Ajouter une URL d'image" className="w-full p-2 border rounded"/>
                        <button type="button" onClick={handleAddProductImage} className="bg-expert-blue text-white font-bold p-2 rounded hover:bg-expert-blue/80 flex-shrink-0">Ajouter</button>
                    </div>
                     <label htmlFor="local-image-upload-product" className="mt-2 text-sm text-expert-blue hover:underline cursor-pointer">
                        Ou uploader une image locale
                    </label>
                    <input type="file" id="local-image-upload-product" accept="image/*" onChange={(e) => handleLocalImageUpload(e, setProductFormData)} className="hidden"/>

                    <div className="flex flex-wrap gap-2 mt-2">
                        {productFormData.images.map(img => (
                            <div key={img} className="relative">
                                <img src={img} alt="Aperçu" className="h-20 w-20 object-cover rounded"/>
                                <button type="button" onClick={() => handleRemoveProductImage(img)} className="absolute top-0 right-0 bg-red-500 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs">&times;</button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex justify-end gap-4 pt-4 border-t">
                    <button type="button" onClick={handleCloseProductModal} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300">Annuler</button>
                    <button type="submit" className="bg-expert-green text-white font-bold py-2 px-4 rounded-lg hover:bg-green-600">
                        {editingProduct ? 'Enregistrer les modifications' : 'Ajouter la pièce'}
                    </button>
                </div>
            </form>
        </Modal>

        <Modal isOpen={isAuctionModalOpen} onClose={handleCloseAuctionModal} title={editingAuction ? "Modifier l'offre" : "Ajouter une offre"}>
            <form onSubmit={handleAuctionSubmit} className="space-y-4">
                <h4 className="font-semibold">Détails du Véhicule</h4>
                <div className="grid grid-cols-2 gap-4">
                    <input name="vehicle.name" placeholder="Nom complet (ex: Peugeot 208)" value={auctionFormData.vehicle?.name || ''} onChange={handleAuctionFormChange} className="p-2 border rounded col-span-2"/>
                    <input name="vehicle.brand" placeholder="Marque" value={auctionFormData.vehicle?.brand || ''} onChange={handleAuctionFormChange} className="p-2 border rounded"/>
                    <input name="vehicle.model" placeholder="Modèle" value={auctionFormData.vehicle?.model || ''} onChange={handleAuctionFormChange} className="p-2 border rounded"/>
                    <input name="vehicle.year" type="number" placeholder="Année" value={auctionFormData.vehicle?.year || ''} onChange={handleAuctionFormChange} className="p-2 border rounded"/>
                    <input name="vehicle.mileage" type="number" placeholder="Kilométrage" value={auctionFormData.vehicle?.mileage || ''} onChange={handleAuctionFormChange} className="p-2 border rounded"/>
                </div>
                <textarea name="vehicle.description" placeholder="Description du véhicule" value={auctionFormData.vehicle?.description || ''} onChange={handleAuctionFormChange} rows={3} className="w-full p-2 border rounded"/>
                
                <h4 className="font-semibold">Détails de l'Offre</h4>
                <div className="grid grid-cols-2 gap-4">
                    <input name="startingPrice" type="number" placeholder="Prix de départ (€)" value={auctionFormData.startingPrice} onChange={handleAuctionFormChange} className="p-2 border rounded"/>
                    <div>
                        <label className="block text-sm">Date de fin</label>
                        <input name="endDate" type="datetime-local" value={auctionFormData.endDate.toISOString().substring(0, 16)} onChange={handleAuctionFormChange} className="w-full p-2 border rounded"/>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium">Images du Véhicule (URLs)</label>
                    <div className="flex items-center gap-2">
                        <input type="text" value={auctionImageInput} onChange={(e) => setAuctionImageInput(e.target.value)} placeholder="Ajouter une URL d'image" className="w-full p-2 border rounded"/>
                        <button type="button" onClick={handleAddAuctionImage} className="bg-expert-blue text-white font-bold p-2 rounded hover:bg-expert-blue/80 flex-shrink-0">Ajouter</button>
                    </div>
                    <label htmlFor="local-image-upload-auction" className="mt-2 text-sm text-expert-blue hover:underline cursor-pointer">
                        Ou uploader une image locale
                    </label>
                    <input type="file" id="local-image-upload-auction" accept="image/*" onChange={handleLocalAuctionImageUpload} className="hidden"/>
                    <div className="flex flex-wrap gap-2 mt-2">
                        {auctionFormData.vehicle?.images?.map(img => (
                            <div key={img} className="relative">
                                <img src={img} alt="Aperçu" className="h-20 w-20 object-cover rounded"/>
                                <button type="button" onClick={() => handleRemoveAuctionImage(img)} className="absolute top-0 right-0 bg-red-500 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs">&times;</button>
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium">Vidéos (URLs)</label>
                    <div className="flex items-center gap-2">
                        <input type="text" value={auctionVideoInput} onChange={(e) => setAuctionVideoInput(e.target.value)} placeholder="Ajouter une URL de vidéo" className="w-full p-2 border rounded"/>
                        <button type="button" onClick={handleAddAuctionVideo} className="bg-expert-blue text-white font-bold p-2 rounded hover:bg-expert-blue/80 flex-shrink-0">Ajouter</button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                        {auctionFormData.vehicle?.videos?.map(video => (
                            <div key={video} className="relative p-2 bg-gray-100 rounded text-sm">
                                <span>{video.substring(0,30)}...</span>
                                <button type="button" onClick={() => handleRemoveAuctionVideo(video)} className="ml-2 text-red-500">&times;</button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex justify-end gap-4 pt-4 border-t">
                    <button type="button" onClick={handleCloseAuctionModal} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300">Annuler</button>
                    <button type="submit" className="bg-expert-green text-white font-bold py-2 px-4 rounded-lg hover:bg-green-600">
                        {editingAuction ? 'Enregistrer les modifications' : "Ajouter l'offre"}
                    </button>
                </div>
            </form>
        </Modal>

        <Modal isOpen={isUserEditModalOpen} onClose={() => setIsUserEditModalOpen(false)} title={`Modifier ${editingUser?.name}`}>
            <form onSubmit={handleUpdateUser} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium">Nom</label>
                    <input type="text" value={userEditFormData.name || ''} onChange={e => setUserEditFormData({...userEditFormData, name: e.target.value})} className="w-full p-2 border rounded" required/>
                </div>
                <div>
                    <label className="block text-sm font-medium">Email</label>
                    <input type="email" value={userEditFormData.email || ''} onChange={e => setUserEditFormData({...userEditFormData, email: e.target.value})} className="w-full p-2 border rounded" required/>
                </div>
                <div>
                    <label className="block text-sm font-medium">Rôle</label>
                    <select value={userEditFormData.role || ''} onChange={e => setUserEditFormData({...userEditFormData, role: e.target.value as User['role']})} className="w-full p-2 border rounded bg-white">
                        <option value="Staff">Staff</option>
                        <option value="Admin">Admin</option>
                    </select>
                </div>
                <div className="flex justify-end gap-4 pt-4 border-t">
                    <button type="button" onClick={() => setIsUserEditModalOpen(false)} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300">Annuler</button>
                    <button type="submit" className="bg-expert-green text-white font-bold py-2 px-4 rounded-lg hover:bg-green-600">Enregistrer</button>
                </div>
            </form>
        </Modal>

         <Modal isOpen={isComposeModalOpen} onClose={() => setIsComposeModalOpen(false)} title="Nouveau message">
            <form onSubmit={handleComposeSubmit} className="space-y-4">
                <input name="to" type="email" placeholder="Destinataire (email)" value={composeFormData.to} onChange={handleComposeFormChange} className="w-full p-2 border rounded" required/>
                <input name="subject" placeholder="Sujet" value={composeFormData.subject} onChange={handleComposeFormChange} className="w-full p-2 border rounded" required/>
                <textarea name="content" placeholder="Votre message..." value={composeFormData.content} onChange={handleComposeFormChange} rows={8} className="w-full p-2 border rounded" required/>
                <input type="file" onChange={e => setComposeAttachment(e.target.files ? e.target.files[0] : null)} className="text-sm"/>
                <div className="flex justify-end gap-4 pt-4 border-t">
                    <button type="button" onClick={() => setIsComposeModalOpen(false)} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300">Annuler</button>
                    <button type="submit" disabled={isSending} className="bg-expert-green text-white font-bold py-2 px-4 rounded-lg hover:bg-green-600 disabled:bg-gray-400">
                        {isSending ? "Envoi..." : "Envoyer"}
                    </button>
                </div>
            </form>
        </Modal>
      </div>
    </div>
  );
}