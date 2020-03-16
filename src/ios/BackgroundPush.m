#import <Cordova/CDV.h>
#import "BackgroundPush.h"


@interface BackgroundPush () {
    
}

@end


@implementation BackgroundPush

- (void)pluginInitialize {

    
}

- (void)getBackgroundNotification:(CDVInvokedUrlCommand *)command {
    self.callbackId = command.callbackId;

    self.lastData = [[NSUserDefaults standardUserDefaults] objectForKey:@"backgroundNotification"];

    // self.lastData = @{
    //          @"values": @{
    //                  @"target":@"menu.shopAndEarn",
    //                  @"_od":@"http://www.foodlion.com/shop-and-earn"
    //                  }
    //          };
             
    if (self.lastData) {
         NSLog(@"%@",self.lastData.description);
        CDVPluginResult *pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:self.lastData];
        [pluginResult setKeepCallbackAsBool:YES];
        [self.commandDelegate sendPluginResult:pluginResult callbackId:self.callbackId];

        self.lastData = nil;
        [[NSUserDefaults standardUserDefaults] setObject:nil forKey:@"backgroundNotification"];
        [[NSUserDefaults standardUserDefaults] synchronize];
    }
}


@end
