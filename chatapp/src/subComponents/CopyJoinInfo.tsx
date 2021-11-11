/*
********************************************
 Copyright © 2021 Agora Lab, Inc., all rights reserved.
 AppBuilder and all associated components, source code, APIs, services, and documentation 
 (the “Materials”) are owned by Agora Lab, Inc. and its licensors. The Materials may not be 
 accessed, used, modified, or distributed for any purpose without a license from Agora Lab, Inc.  
 Use without a license or in violation of any license terms and conditions (including use for 
 any purpose competitive to Agora Lab, Inc.’s business) is strictly prohibited. For more 
 information visit https://appbuilder.agora.io. 
*********************************************
*/
import React from 'react';
import {Text, StyleSheet, Image, TouchableOpacity} from 'react-native';
import Clipboard from './Clipboard';
import {gql, useQuery} from '@apollo/client';
import icons from '../assets/icons';
import platform from '../subComponents/Platform';
import {useParams} from '../components/Router';
import Toast from '../../react-native-toast-message';

const SHARE = gql`
  query share($passphrase: String!) {
    share(passphrase: $passphrase) {
      passphrase {
        host
        view
      }
      channel
      title
      pstn {
        number
        dtmf
      }
    }
  }
`;

const ParticipantView = (props: {showText?: boolean}) => {
  const {phrase} = useParams<{phrase: string}>();
  const {data, loading, error} = useQuery(SHARE, {
    variables: {passphrase: phrase},
  });
  const copyToClipboard = () => {
    Toast.show({text1: 'Скопировано в буфер обмена', visibilityTime: 1000});
    if (data && !loading) {
      let stringToCopy = '';
      if ($config.FRONTEND_ENDPOINT) {
        stringToCopy += `Встреча - ${data.share.title}\nURL для участия: ${$config.FRONTEND_ENDPOINT}/${data.share.passphrase.view}`;
        if (data.share.passphrase.host) {
          stringToCopy += `\nURL для хоста: ${$config.FRONTEND_ENDPOINT}/${data.share.passphrase.host}`;
        }
      } else {
        if (platform === 'web') {
          stringToCopy += `Встреча - ${data.share.title}\nURL для участия: ${window.location.origin}/${data.share.passphrase.view}`;
          if (data.share.passphrase.host) {
            stringToCopy += `\nURL для хоста: ${window.location.origin}/${data.share.passphrase.host}`;
          }
        } else {
          stringToCopy += `Встреча - ${data.share.title}\nID Участияя: ${data.share.passphrase.view}`;
          if (data.share.passphrase.host) {
            stringToCopy += `\nID хоста: ${data.share.passphrase.host}`;
          }
        }
      }
      if (data.share.pstn) {
        stringToCopy += `\nPSTN номер: ${data.share.pstn.number}\nPSTN пин: ${data.share.pstn.dtmf}`;
      }
      console.log('Копирование строки в буфер обмена:', stringToCopy);
      Clipboard.setString(stringToCopy);
      // Clipboard.setString(JSON.stringify(data));
    }
  };

  return (
    <TouchableOpacity
      disabled={!data}
      style={style.backButton}
      onPress={() => copyToClipboard()}>
      <Image
        resizeMode={'contain'}
        style={!data ? [style.backIcon] : style.backIcon}
        source={{uri: icons.clipboard}}
      />
      {props.showText ? (
        <Text style={{color: $config.PRIMARY_FONT_COLOR}}>
          Скопировать приглашение
        </Text>
      ) : (
        <></>
      )}
    </TouchableOpacity>
  );
};

const style = StyleSheet.create({
  backButton: {
    // marginLeft: 5,
    flexDirection: 'row',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  backIcon: {
    width: 28,
    height: 20,
    alignSelf: 'center',
    justifyContent: 'center',
    tintColor: $config.PRIMARY_FONT_COLOR,
  },
});

export default ParticipantView;
