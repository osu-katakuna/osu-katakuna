const LoginEvent = require('./LoginEvent');
const PingEvent = require('./PingEvent');
const StatusUpdateEvent = require('./StatusUpdateEvent');
const UserStatusUpdateEvent = require('./UserStatusUpdateEvent');
const ChangeActionEvent = require('./ChangeActionEvent');
const LogoffEvent = require('./LogoffEvent');
const SpectateEvent = require('./SpectateEvent');
const StopSpectatingEvent = require('./StopSpectatingEvent');
const SpectatorFrameEvent = require('./SpectatorFrameEvent');
const CannotSpectateEvent = require('./CannotSpectateEvent');
const JoinChatChannelEvent = require('./JoinChatChannelEvent');
const PublicMessageEvent = require('./PublicMessageEvent');
const PrivateMessageEvent = require('./PrivateMessageEvent');
const PartChatChannelEvent = require('./PartChatChannelEvent');
const AddFriendEvent = require('./AddFriendEvent');
const RemoveFriendEvent = require('./RemoveFriendEvent');
const JoinLobbyEvent = require('./JoinLobbyEvent');
const PartLobbyEvent = require('./PartLobbyEvent');
const CreateMatchEvent = require('./CreateMatchEvent');
const JoinMatchEvent = require('./JoinMatchEvent');
const LeaveMatchEvent = require('./LeaveMatchEvent');
const ChangeMatchSettingsEvent = require('./ChangeMatchSettingsEvent');
const SetMatchHostEvent = require('./SetMatchHostEvent');
const UpdateMatchPasswordEvent = require('./UpdateMatchPasswordEvent');
const InviteToMatchEvent = require('./InviteToMatchEvent');

module.exports = {
  LoginEvent,
  PingEvent,
  StatusUpdateEvent,
  UserStatusUpdateEvent,
  ChangeActionEvent,
  LogoffEvent,
  SpectateEvent,
  StopSpectatingEvent,
  SpectatorFrameEvent,
  CannotSpectateEvent,
  JoinChatChannelEvent,
  PublicMessageEvent,
  PrivateMessageEvent,
  PartChatChannelEvent,
  AddFriendEvent,
  RemoveFriendEvent,
  JoinLobbyEvent,
  PartLobbyEvent,
  CreateMatchEvent,
  JoinMatchEvent,
  LeaveMatchEvent,
  ChangeMatchSettingsEvent,
  SetMatchHostEvent,
  UpdateMatchPasswordEvent,
  InviteToMatchEvent
};
