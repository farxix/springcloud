 # <context:annotation-config />
是用于激活那些已经在spring容器里注册过的bean上面的注解，也就是显示的向Spring注册

AutowiredAnnotationBeanPostProcessor
CommonAnnotationBeanPostProcessor
PersistenceAnnotationBeanPostProcessor
RequiredAnnotationBeanPostProcessor

这四个Processor，注册这4个BeanPostProcessor的作用，就是为了你的系统能够识别相应的注解。BeanPostProcessor就是处理注解的处理器。

一般来说，像@ Resource 、@ PostConstruct、@Antowired这些注解在自动注入还是比较常用，所以如果总是需要按照传统的方式一条一条配置显得
有些繁琐和没有必要，于是spring给我们提供< context:annotation-config/>的简化配置方式，自动帮你完成声明。

思考1：假如我们要使用如@Component、@Controller、@Service等这些注解，使用< context:annotation-config/>能否激活这些注解呢?
答案：单纯使用< context:annotation-config/>对上面这些注解无效，不能激活！


# <context:component-scan />
该配置项其实也包含了自动注入上述processor的功能，因此当使用 < context:component-scan/> 后，就可以将 < context:annotation-config/> 移除了。
通过对base-package配置，就可以把controller包下 service包下 dao包下的注解全部扫描到了！

# <mvc:annotation-driven />
<mvc:annotation-driven/>从标签的shecma就能看出来，**mvc**，主要就是为了Spring MVC来用的，提供Controller请求转发，json自动转换等功能。
相比上面的两个shecma是context开头，那么主要是解决spring**容器**的一些注解。<mvc:annotation-driven/> 是一种简写形式，完全可以手动配置替代这种简写形式，
简写形式可以让初学都快速应用默认配置方案。<mvc:annotation-driven /> 会自动注册DefaultAnnotationHandlerMapping与AnnotationMethodHandlerAdapter 两个bean,
是spring MVC为@Controllers分发请求所必须的。并提供了：数据绑定支持，@NumberFormatannotation支持，@DateTimeFormat支持，@Valid支持，读写XML的支持（JAXB），读写JSON的支持（Jackson）。

在实际开发使用SpringMVC开启这个配置，否则会出现一些功能不能正常使用！

