from rest_framework.throttling import UserRateThrottle, AnonRateThrottle

class SensitiveActionThrottle(AnonRateThrottle):
    scope = 'sensitive'

class SensitiveUserActionThrottle(UserRateThrottle):
    scope = 'sensitive'
