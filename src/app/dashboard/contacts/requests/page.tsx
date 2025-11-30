import ContactListContainer from '../_components/ContactListContainer';
import FriendRequestList from '../_components/FriendRequestList';

export default function RequestsPage() {
  return (
    <ContactListContainer title="新的联系人">
      <FriendRequestList />
    </ContactListContainer>
  );
}
