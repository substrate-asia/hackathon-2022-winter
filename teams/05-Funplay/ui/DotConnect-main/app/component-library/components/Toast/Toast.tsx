/* eslint-disable react/prop-types */

// Third party dependencies.
import React, {
  forwardRef,
  useImperativeHandle,
  useMemo,
  useState,
} from 'react';
import {
  Dimensions,
  LayoutChangeEvent,
  StyleProp,
  View,
  ViewStyle,
} from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// External dependencies.
import Avatar, { AvatarSize, AvatarVariants } from '../Avatars/Avatar';
import { AvatarAccountType } from '../Avatars/Avatar/variants/AvatarAccount';
import Text, { TextVariants } from '../Texts/Text';
import Button, { ButtonVariants } from '../Buttons/Button';

// Internal dependencies.
import {
  ToastLabelOptions,
  ToastLinkButtonOptions,
  ToastOptions,
  ToastRef,
  ToastVariants,
} from './Toast.types';
import styles from './Toast.styles';

const visibilityDuration = 2500;
const animationDuration = 250;
const bottomPadding = 16;
const screenHeight = Dimensions.get('window').height;

const Toast = forwardRef((_, ref: React.ForwardedRef<ToastRef>) => {
  const [toastOptions, setToastOptions] = useState<ToastOptions | undefined>(
    undefined,
  );
  const { bottom: bottomNotchSpacing } = useSafeAreaInsets();
  const translateYProgress = useSharedValue(screenHeight);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateYProgress.value }],
  }));
  const baseStyle: StyleProp<Animated.AnimateStyle<StyleProp<ViewStyle>>> =
    useMemo(
      () => [styles.base, animatedStyle],
      /* eslint-disable-next-line */
      [],
    );

  const showToast = (options: ToastOptions) => {
    if (toastOptions) {
      return;
    }
    setToastOptions(options);
  };

  useImperativeHandle(ref, () => ({
    showToast,
  }));

  const resetState = () => setToastOptions(undefined);

  const onAnimatedViewLayout = (e: LayoutChangeEvent) => {
    if (toastOptions) {
      const { height } = e.nativeEvent.layout;
      const translateYToValue = -(bottomPadding + bottomNotchSpacing);

      translateYProgress.value = height;
      translateYProgress.value = withTiming(
        translateYToValue,
        { duration: animationDuration },
        () =>
          (translateYProgress.value = withDelay(
            visibilityDuration,
            withTiming(
              height,
              { duration: animationDuration },
              runOnJS(resetState),
            ),
          )),
      );
    }
  };

  const renderLabel = (labelOptions: ToastLabelOptions) => (
    <Text variant={TextVariants.sBodyMD}>
      {labelOptions.map(({ label, isBold }, index) => (
        <Text
          key={`toast-label-${index}`}
          variant={isBold ? TextVariants.sBodyMDBold : TextVariants.sBodyMD}
          style={styles.label}
        >
          {label}
        </Text>
      ))}
    </Text>
  );

  const renderButtonLink = (linkButtonOptions?: ToastLinkButtonOptions) =>
    linkButtonOptions && (
      <Button
        variant={ButtonVariants.Link}
        onPress={linkButtonOptions.onPress}
        textVariants={TextVariants.sBodyMD}
      >
        {linkButtonOptions.label}
      </Button>
    );

  const renderAvatar = () => {
    switch (toastOptions?.variant) {
      case ToastVariants.Plain:
        return null;
      case ToastVariants.Account: {
        const { accountAddress } = toastOptions;
        return (
          <Avatar
            variant={AvatarVariants.Account}
            accountAddress={accountAddress}
            type={AvatarAccountType.JazzIcon}
            size={AvatarSize.Md}
            style={styles.avatar}
          />
        );
      }
      case ToastVariants.Network: {
        const { networkImageSource } = toastOptions;
        return (
          <Avatar
            variant={AvatarVariants.Network}
            imageSource={networkImageSource}
            size={AvatarSize.Md}
            style={styles.avatar}
          />
        );
      }
    }
  };

  const renderToastContent = (options: ToastOptions) => {
    const { labelOptions, linkButtonOptions } = options;

    return (
      <>
        {renderAvatar()}
        <View style={styles.labelsContainer}>
          {renderLabel(labelOptions)}
          {renderButtonLink(linkButtonOptions)}
        </View>
      </>
    );
  };

  if (!toastOptions) {
    return null;
  }

  return (
    <Animated.View onLayout={onAnimatedViewLayout} style={baseStyle}>
      {renderToastContent(toastOptions)}
    </Animated.View>
  );
});

export default Toast;