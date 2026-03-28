USE `MallMAP`;

SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE `FavoriteProduct`;
TRUNCATE TABLE `FavoriteStore`;
TRUNCATE TABLE `Product`;
TRUNCATE TABLE `Store`;
TRUNCATE TABLE `Floor`;
TRUNCATE TABLE `Mall`;
TRUNCATE TABLE `Category`;
TRUNCATE TABLE `StoreCategory`;
TRUNCATE TABLE `User`;
TRUNCATE TABLE `Role`;
SET FOREIGN_KEY_CHECKS = 1;

INSERT INTO `Role` (`RoleID`, `RoleName`) VALUES
(1, 'Admin'),
(2, 'StoreOwner'),
(3, 'Customer');

INSERT INTO `StoreCategory` (`StoreCategoryID`, `StoreCategoryName`) VALUES
(1, 'Food'),
(2, 'Fashion'),
(3, 'Electronics'),
(4, 'Sports');

INSERT INTO `Category` (`CategoryID`, `CategoryName`) VALUES
(1, 'Beverages'),
(2, 'Clothing'),
(3, 'Gadgets'),
(4, 'Shoes'),
(5, 'Meals');

INSERT INTO `Mall` (`MallID`, `MallName`, `Location`, `IsPopular`, `MallImageURL`) VALUES
(1, 'Central Smart Mall', 'Bangkok', 1, 'https://images.unsplash.com/photo-1519567241046-7f570eee3ce6?w=800'),
(2, 'Future Plaza', 'Bangkok', 0, 'https://images.unsplash.com/photo-1481437156560-3205f6a55735?w=800');

INSERT INTO `Floor` (`FloorID`, `FloorName`, `MallID`, `FloorCode`, `FloorOrder`) VALUES
(1, 'Lower Ground', 1, 'LG', 1),
(2, 'Ground Floor', 1, 'G', 2),
(3, 'Floor 1', 1, '1', 3),
(4, 'Floor 2', 1, '2', 4),
(5, 'Ground Floor', 2, 'G', 1);

INSERT INTO `User` (`UserID`, `UserName`, `Email`, `PasswordHash`, `RoleID`) VALUES
(1, 'admin', 'admin@mallmap.com', '$2y$12$Bx13A2pi6Tf0gC7jxMsKFeiyBib6o4.dAZ6ljjleU3BWYVpWLCtAW', 1),
(2, 'techworld_owner', 'techworld@mallmap.com', '$2y$12$Bx13A2pi6Tf0gC7jxMsKFeiyBib6o4.dAZ6ljjleU3BWYVpWLCtAW', 2),
(3, 'foodcourt_owner', 'foodcourt@mallmap.com', '$2y$12$Bx13A2pi6Tf0gC7jxMsKFeiyBib6o4.dAZ6ljjleU3BWYVpWLCtAW', 2),
(4, 'fashionhub_owner', 'fashionhub@mallmap.com', '$2y$12$Bx13A2pi6Tf0gC7jxMsKFeiyBib6o4.dAZ6ljjleU3BWYVpWLCtAW', 2),
(5, 'customer1', 'customer1@mallmap.com', '$2y$12$Bx13A2pi6Tf0gC7jxMsKFeiyBib6o4.dAZ6ljjleU3BWYVpWLCtAW', 3);

INSERT INTO `Store` (`StoreID`, `UserID`, `StoreName`, `StoreCategoryName`, `StoreCategoryIcon`, `StoreCategoryID`, `Description`, `Phone`, `OpeningHours`, `LogoURL`, `MallID`, `FloorName`, `FloorID`, `PosX`, `PosY`) VALUES
(1, 2, 'Tech World', 'Electronics', '💻', 3, 'Gadgets and devices', '020000001', '10:00-22:00', 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400', 1, 'Floor 1', 3, 42, 35),
(2, 3, 'Food Court Plus', 'Food', '🍜', 1, 'Thai and international food', '020000002', '10:00-22:00', 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=400', 1, 'Ground Floor', 2, 55, 52),
(3, 4, 'Fashion Hub', 'Fashion', '👗', 2, 'Modern fashion and clothing', '020000003', '10:00-22:00', 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400', 1, 'Floor 2', 4, 63, 30);

INSERT INTO `Product` (`ProductID`, `ProductName`, `Price`, `StockQuantity`, `ProductImageURL`, `StoreID`, `CategoryID`, `IsActive`) VALUES
(1, 'Wireless Earbuds', 1299.00, 18, 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400', 1, 3, 1),
(2, 'Smart Watch', 2990.00, 7, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400', 1, 3, 1),
(3, 'Set Menu A', 89.00, 999, 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400', 2, 5, 1),
(4, 'Iced Latte', 95.00, 80, 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400', 2, 1, 1),
(5, 'Cotton T-Shirt', 299.00, 45, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400', 3, 2, 1),
(6, 'Running Shoes', 2490.00, 15, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400', 3, 4, 1);

INSERT INTO `FavoriteStore` (`UserID`, `StoreID`) VALUES
(5, 1),
(5, 2);

INSERT INTO `FavoriteProduct` (`UserID`, `ProductID`) VALUES
(5, 1),
(5, 3);
