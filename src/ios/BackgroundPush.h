#import <UIKit/UIKit.h>
#import <Cordova/CDV.h>
#import <Cordova/CDVPlugin.h>


@interface BackgroundPush : CDVPlugin {
}

- (void)getBackgroundNotification:(CDVInvokedUrlCommand *)command;

@property (nonatomic, copy) NSString* callbackId;
@property (nonatomic, retain) NSDictionary* lastData;




@end
